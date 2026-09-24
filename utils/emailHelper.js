
require('dotenv').config();

const Imap = require('imap');
const { simpleParser } = require('mailparser');


// ============================================================
// IMAP CONFIGURATION
// ============================================================

const imapConfig = {

  user:
    process.env.EMAIL_USER,

  password:
    process.env.EMAIL_PASS,

  host:
    'imap.gmail.com',

  port:
    993,

  // Gmail IMAP over implicit TLS
  tls:
    true,

  // Explicit TLS settings
  tlsOptions: {

    servername:
      'imap.gmail.com',

    rejectUnauthorized:
      false,

  },

  // Do not attempt STARTTLS on port 993
  autotls:
    'never',

  connTimeout:
    30000,

  authTimeout:
    15000,

  socketTimeout:
    30000,

};


// ============================================================
// EMAIL CONFIG VALIDATION
// ============================================================

const emailConfigured = Boolean(

  imapConfig.user &&

  imapConfig.password

);


if (!emailConfigured) {

  console.warn(
    '[EMAIL HELPER] WARNING: EMAIL_USER or EMAIL_PASS is not configured'
  );

} else {

  console.log(
    `[EMAIL HELPER] IMAP configured for: ${imapConfig.user}`
  );

}


// ============================================================
// NORMALIZE EMAIL
// ============================================================

function normalizeEmail(email) {

  return String(
    email || ''
  )
    .toLowerCase()
    .trim();

}


// ============================================================
// NORMALIZE SUBJECT
// ============================================================

function normalizeSubject(subject) {

  return String(
    subject || ''
  )
    .toLowerCase()
    .replace(
      /\s+/g,
      ' '
    )
    .trim();

}


// ============================================================
// NORMALIZE DATE
// ============================================================

function normalizeDate(value) {

  if (!value) {

    return null;

  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null;

  }

  return date;

}


// ============================================================
// CREATE IMAP CONNECTION
// ============================================================

function createImapConnection() {

  return new Promise(
    (resolve, reject) => {

      const imap =
        new Imap(
          imapConfig
        );


      let settled = false;


      const connectionTimeout =
        setTimeout(
          () => {

            if (settled) {

              return;

            }

            settled = true;


            try {

              imap.destroy();

            } catch {

              // Ignore destroy errors.

            }


            reject(
              new Error(
                'IMAP connection timeout after 30 seconds'
              )
            );

          },
          30000
        );


      imap.once(
        'ready',
        () => {

          if (settled) {

            return;

          }


          settled = true;


          clearTimeout(
            connectionTimeout
          );


          console.log(
            `[EMAIL] IMAP connected: ${imapConfig.user}`
          );


          resolve(
            imap
          );

        }
      );


      imap.once(
        'error',
        (error) => {

          if (settled) {

            return;

          }


          settled = true;


          clearTimeout(
            connectionTimeout
          );


          reject(
            new Error(
              `IMAP connection error: ${error.message}`
            )
          );

        }
      );


      imap.once(
        'end',
        () => {

          clearTimeout(
            connectionTimeout
          );

        }
      );


      try {

        imap.connect();

      } catch (error) {

        clearTimeout(
          connectionTimeout
        );


        if (!settled) {

          settled = true;

          reject(
            error
          );

        }

      }

    }
  );

}


// ============================================================
// OPEN INBOX
// ============================================================

function openInbox(imap) {

  return new Promise(
    (resolve, reject) => {

      imap.openBox(
        'INBOX',
        false,
        (error, box) => {

          if (error) {

            reject(
              new Error(
                `Failed to open INBOX: ${error.message}`
              )
            );

            return;

          }


          resolve(
            box
          );

        }
      );

    }
  );

}


// ============================================================
// CLOSE IMAP SAFELY
// ============================================================

function closeImap(imap) {

  if (!imap) {

    return;

  }


  try {

    imap.end();

  } catch {

    try {

      imap.destroy();

    } catch {

      // Ignore close errors.

    }

  }

}


// ============================================================
// FETCH LATEST EMAILS
//
// Used by existing/general email functions.
// waitForEmail() below uses a faster header-only method.
// ============================================================

function fetchLatestEmails(
  limit = 20
) {

  return new Promise(
    async (resolve, reject) => {

      let imap = null;

      let finished = false;


      try {

        imap =
          await createImapConnection();


        const box =
          await openInbox(
            imap
          );


        const total =
          Number(
            box.messages.total
          ) || 0;


        if (
          total === 0
        ) {

          closeImap(
            imap
          );

          resolve(
            []
          );

          return;

        }


        const from =
          Math.max(
            1,
            total - limit + 1
          );


        console.log(
          `[EMAIL] Fetching messages ${from}:${total}`
        );


        const fetch =
          imap.seq.fetch(
            `${from}:${total}`,
            {

              bodies: [
                ''
              ],

              struct:
                true,

              markSeen:
                false,

            }
          );


        const parsedEmails = [];

        const parsePromises = [];


        fetch.on(
          'message',
          (
            msg,
            seqno
          ) => {

            const parsePromise =
              new Promise(
                (
                  resolveMessage,
                  rejectMessage
                ) => {

                  const chunks = [];

                  let uid = null;


                  msg.once(
                    'attributes',
                    (
                      attributes
                    ) => {

                      uid =
                        attributes?.uid ||
                        null;

                    }
                  );


                  msg.on(
                    'body',
                    (
                      stream
                    ) => {

                      stream.on(
                        'data',
                        (
                          chunk
                        ) => {

                          chunks.push(
                            Buffer.isBuffer(
                              chunk
                            )
                              ? chunk
                              : Buffer.from(
                                  chunk
                                )
                          );

                        }
                      );


                      stream.once(
                        'error',
                        (
                          error
                        ) => {

                          rejectMessage(
                            new Error(
                              `Email body read error (seq ${seqno}): ${error.message}`
                            )
                          );

                        }
                      );

                    }
                  );


                  msg.once(
                    'end',
                    async () => {

                      try {

                        const rawEmail =
                          Buffer.concat(
                            chunks
                          );


                        if (
                          rawEmail.length === 0
                        ) {

                          rejectMessage(
                            new Error(
                              `Empty email content received (seq ${seqno})`
                            )
                          );

                          return;

                        }


                        const parsed =
                          await simpleParser(
                            rawEmail
                          );


                        parsed._seqno =
                          seqno;

                        parsed._uid =
                          uid;


                        parsedEmails.push(
                          parsed
                        );


                        resolveMessage();

                      } catch (error) {

                        rejectMessage(
                          new Error(
                            `Email parse error (seq ${seqno}): ${error.message}`
                          )
                        );

                      }

                    }
                  );

                }
              );


            parsePromises.push(
              parsePromise
            );

          }
        );


        fetch.once(
          'error',
          (
            error
          ) => {

            if (finished) {

              return;

            }


            finished = true;


            closeImap(
              imap
            );


            reject(
              new Error(
                `Fetch error: ${error.message}`
              )
            );

          }
        );


        fetch.once(
          'end',
          async () => {

            if (finished) {

              return;

            }


            try {

              await Promise.all(
                parsePromises
              );


              parsedEmails.sort(
                (
                  a,
                  b
                ) => {

                  const dateA =
                    normalizeDate(
                      a.date
                    )?.getTime() || 0;


                  const dateB =
                    normalizeDate(
                      b.date
                    )?.getTime() || 0;


                  return (
                    dateB -
                    dateA
                  );

                }
              );


              finished = true;


              closeImap(
                imap
              );


              resolve(
                parsedEmails
              );

            } catch (error) {

              finished = true;


              closeImap(
                imap
              );


              reject(
                error
              );

            }

          }
        );

      } catch (error) {

        finished = true;


        closeImap(
          imap
        );


        reject(
          error
        );

      }

    }
  );

}

// ============================================================
// FETCH RECENT EMAIL HEADERS ONLY
//
// Important:
// - Do NOT use server-side FROM/TO/SUBJECT/SINCE filtering.
// - Fetch only recent message headers.
// - Exact matching is done in JavaScript.
// - This avoids Gmail/IMAP search inconsistencies.
// ============================================================

function fetchRecentEmailHeaders({
  limit = 20,
} = {}) {

  return new Promise(
    async (resolve, reject) => {

      let imap = null;
      let finished = false;

      try {

        imap =
          await createImapConnection();

        const box =
          await openInbox(
            imap
          );

        const total =
          Number(
            box.messages.total
          ) || 0;

        if (
          total === 0
        ) {

          closeImap(
            imap
          );

          resolve([]);

          return;

        }

        // ------------------------------------------------------
        // Only inspect latest N messages.
        // ------------------------------------------------------

        const from =
          Math.max(
            1,
            total - limit + 1
          );

        console.log(
          `[EMAIL] Checking recent message headers ${from}:${total}`
        );

        const sequenceRange =
          `${from}:${total}`;

        const fetch =
          imap.seq.fetch(
            sequenceRange,
            {

              bodies: [
                'HEADER.FIELDS (FROM TO CC BCC SUBJECT DATE MESSAGE-ID)'
              ],

              struct:
                false,

              markSeen:
                false,

            }
          );

        const parsedEmails = [];
        const parsePromises = [];

        // ------------------------------------------------------
        // MESSAGE
        // ------------------------------------------------------

        fetch.on(
          'message',
          (
            msg,
            seqno
          ) => {

            const parsePromise =
              new Promise(
                (
                  resolveMessage,
                  rejectMessage
                ) => {

                  let headerText = '';
                  let uid = null;

                  msg.once(
                    'attributes',
                    (
                      attributes
                    ) => {

                      uid =
                        attributes?.uid ||
                        null;

                    }
                  );

                  msg.on(
                    'body',
                    (
                      stream
                    ) => {

                      stream.on(
                        'data',
                        (
                          chunk
                        ) => {

                          headerText +=
                            chunk.toString(
                              'utf8'
                            );

                        }
                      );

                      stream.once(
                        'error',
                        (
                          error
                        ) => {

                          rejectMessage(
                            new Error(
                              `Header read error (seq ${seqno}): ${error.message}`
                            )
                          );

                        }
                      );

                    }
                  );

                  msg.once(
                    'end',
                    async () => {

                      try {

                        if (
                          !headerText
                        ) {

                          resolveMessage();

                          return;

                        }

                        const parsed =
                          await simpleParser(
                            headerText
                          );

                        parsed._seqno =
                          seqno;

                        parsed._uid =
                          uid;

                        parsedEmails.push(
                          parsed
                        );

                        resolveMessage();

                      } catch (error) {

                        rejectMessage(
                          new Error(
                            `Header parse error (seq ${seqno}): ${error.message}`
                          )
                        );

                      }

                    }
                  );

                }
              );

            parsePromises.push(
              parsePromise
            );

          }
        );

        // ------------------------------------------------------
        // FETCH ERROR
        // ------------------------------------------------------

        fetch.once(
          'error',
          (
            error
          ) => {

            if (
              finished
            ) {

              return;

            }

            finished = true;

            closeImap(
              imap
            );

            reject(
              new Error(
                `Header fetch error: ${error.message}`
              )
            );

          }
        );

        // ------------------------------------------------------
        // FETCH COMPLETE
        // ------------------------------------------------------

        fetch.once(
          'end',
          async () => {

            if (
              finished
            ) {

              return;

            }

            try {

              await Promise.all(
                parsePromises
              );

              // Newest first.
              parsedEmails.sort(
                (
                  a,
                  b
                ) => {

                  const dateA =
                    normalizeDate(
                      a.date
                    )?.getTime() || 0;

                  const dateB =
                    normalizeDate(
                      b.date
                    )?.getTime() || 0;

                  return (
                    dateB -
                    dateA
                  );

                }
              );

              finished = true;

              closeImap(
                imap
              );

              resolve(
                parsedEmails
              );

            } catch (error) {

              finished = true;

              closeImap(
                imap
              );

              reject(
                error
              );

            }

          }
        );

      } catch (error) {

        finished = true;

        closeImap(
          imap
        );

        reject(
          error
        );

      }

    }
  );

}



// ============================================================
// FETCH ONE COMPLETE EMAIL BY UID
//
// Only called after current matching email is found.
// This retrieves body + attachments.
// ============================================================

function fetchFullEmailByUid(
  uid
) {

  return new Promise(
    async (resolve, reject) => {

      let imap = null;

      let resolved = false;


      try {

        if (
          !uid
        ) {

          reject(
            new Error(
              'Cannot fetch complete email: UID is missing'
            )
          );

          return;

        }


        imap =
          await createImapConnection();


        await openInbox(
          imap
        );


        console.log(
          `[EMAIL] Fetching complete current email`
        );


        const fetch =
          imap.fetch(
            [uid],
            {

              bodies: [
                ''
              ],

              struct:
                true,

              markSeen:
                false,

            }
          );


        let rawEmail = '';


        fetch.once(
          'message',
          (
            msg
          ) => {

            msg.on(
              'body',
              (
                stream
              ) => {

                stream.on(
                  'data',
                  (
                    chunk
                  ) => {

                    rawEmail +=
                      chunk.toString(
                        'utf8'
                      );

                  }
                );

              }
            );


            msg.once(
              'end',
              async () => {

                try {

                  if (
                    !rawEmail
                  ) {

                    throw new Error(
                      'Empty complete email received'
                    );

                  }


                  const parsed =
                    await simpleParser(
                      rawEmail
                    );


                  parsed._uid =
                    uid;


                  resolved = true;


                  closeImap(
                    imap
                  );


                  resolve(
                    parsed
                  );

                } catch (error) {

                  if (
                    resolved
                  ) {

                    return;

                  }


                  resolved = true;


                  closeImap(
                    imap
                  );


                  reject(
                    new Error(
                      `Full email parse error: ${error.message}`
                    )
                  );

                }

              }
            );

          }
        );


        fetch.once(
          'error',
          (
            error
          ) => {

            if (
              resolved
            ) {

              return;

            }


            resolved = true;


            closeImap(
              imap
            );


            reject(
              new Error(
                `Full email fetch error: ${error.message}`
              )
            );

          }
        );


      } catch (error) {

        if (
          !resolved
        ) {

          resolved = true;


          closeImap(
            imap
          );


          reject(
            error
          );

        }

      }

    }
  );

}


// ============================================================
// RECIPIENT MATCH
// ============================================================

function emailRecipientMatches(
  mail,
  targetEmail
) {

  const normalizedTarget =
    normalizeEmail(
      targetEmail
    );


  if (
    !normalizedTarget
  ) {

    return false;

  }


  // ----------------------------------------------------------
  // Parsed To / CC / BCC
  // ----------------------------------------------------------

  const parsedRecipients = [

    ...(mail?.to?.value || []),

    ...(mail?.cc?.value || []),

    ...(mail?.bcc?.value || []),

  ]
    .map(
      (
        recipient
      ) =>
        normalizeEmail(
          recipient?.address
        )
    )
    .filter(
      Boolean
    );


  if (
    parsedRecipients.includes(
      normalizedTarget
    )
  ) {

    return true;

  }


  // ----------------------------------------------------------
  // Header fallback
  // ----------------------------------------------------------

  const headerValues = [

    mail?.headers?.get?.(
      'delivered-to'
    ),

    mail?.headers?.get?.(
      'x-original-to'
    ),

    mail?.headers?.get?.(
      'to'
    ),

    mail?.headers?.get?.(
      'cc'
    ),

    mail?.headers?.get?.(
      'bcc'
    ),

  ]
    .filter(
      Boolean
    )
    .map(
      (
        value
      ) =>
        String(
          value
        ).toLowerCase()
    );


  for (
    const value of
      headerValues
  ) {

    if (
      value.includes(
        normalizedTarget
      )
    ) {

      return true;

    }

  }


  return false;

}


// ============================================================
// SENDER MATCH
// ============================================================

function emailSenderMatches(
  mail,
  expectedSender
) {

  const normalizedExpected =
    normalizeEmail(
      expectedSender
    );


  if (
    !normalizedExpected
  ) {

    return false;

  }


  // ----------------------------------------------------------
  // Parsed sender address
  // ----------------------------------------------------------

  const parsedSenders = [

    ...(mail?.from?.value || []),

    ...(mail?.sender?.value || []),

    ...(mail?.replyTo?.value || []),

  ]
    .map(
      (
        sender
      ) =>
        normalizeEmail(
          sender?.address
        )
    )
    .filter(
      Boolean
    );


  if (
    parsedSenders.includes(
      normalizedExpected
    )
  ) {

    return true;

  }


  // ----------------------------------------------------------
  // Header fallback
  // ----------------------------------------------------------

  const headerValues = [

    mail?.headers?.get?.(
      'from'
    ),

    mail?.headers?.get?.(
      'sender'
    ),

    mail?.headers?.get?.(
      'reply-to'
    ),

  ]
    .filter(
      Boolean
    )
    .map(
      (
        value
      ) =>
        String(
          value
        ).toLowerCase()
    );


  for (
    const value of
      headerValues
  ) {

    if (
      value.includes(
        normalizedExpected
      )
    ) {

      return true;

    }

  }


  return false;

}


// ============================================================
// SUBJECT MATCH
// ============================================================

function emailSubjectMatches(
  mail,
  subjectKeyword
) {

  const expected =
    normalizeSubject(
      subjectKeyword
    );


  if (
    !expected
  ) {

    return false;

  }


  const actual =
    normalizeSubject(
      mail?.subject
    );


  return actual.includes(
    expected
  );

}


// ============================================================
// DATE MATCH
// ============================================================

function emailDateMatches(
  mail,
  notBefore
) {

  if (
    !notBefore
  ) {

    return true;

  }


  if (
    !mail?.date
  ) {

    return false;

  }


  const mailDate =
    normalizeDate(
      mail.date
    );


  const minimumDate =
    normalizeDate(
      notBefore
    );


  if (
    !mailDate ||
    !minimumDate
  ) {

    return false;

  }


  // Allow 5-second clock difference.
  return (
    mailDate.getTime() >=
    minimumDate.getTime() - 5000
  );

}


// ============================================================
// WAIT FOR VERIFICATION EMAIL
//
// IMPORTANT:
// - Old emails are silently ignored.
// - Only headers are checked during polling.
// - Complete email is fetched only after a match.
// ============================================================

async function waitForEmail({

  subjectKeyword,

  toEmail,

  fromEmail = null,

  timeout = 120000,

  pollInterval = 5000,

  notBefore = null,

}) {

  if (
    !emailConfigured
  ) {

    throw new Error(
      'Email not configured. Set EMAIL_USER and EMAIL_PASS in .env'
    );

  }


  if (
    !toEmail
  ) {

    throw new Error(
      'waitForEmail requires toEmail'
    );

  }


  if (
    !subjectKeyword
  ) {

    throw new Error(
      'waitForEmail requires subjectKeyword'
    );

  }


  const start =
    Date.now();


  let attempts =
    0;


  const targetEmail =
    normalizeEmail(
      toEmail
    );


  const expectedSubject =
    normalizeSubject(
      subjectKeyword
    );


  const expectedSender =
    fromEmail
      ? normalizeEmail(
          fromEmail
        )
      : null;


  console.log(
    '\n============================================================'
  );


  console.log(
    '[EMAIL] 📧 Waiting for current checkout confirmation email'
  );


  console.log(
    `[EMAIL] IMAP account : ${imapConfig.user}`
  );


  console.log(
    `[EMAIL] Target email : ${targetEmail}`
  );


  console.log(
    `[EMAIL] Sender       : ${
      expectedSender ||
      'ANY SENDER'
    }`
  );


  console.log(
    `[EMAIL] Subject      : ${expectedSubject}`
  );


  console.log(
    `[EMAIL] Not before   : ${
      notBefore ||
      'ANY DATE'
    }`
  );


  console.log(
    '============================================================\n'
  );


  // ----------------------------------------------------------
  // POLLING LOOP
  // ----------------------------------------------------------

  while (
    Date.now() - start <
    timeout
  ) {

    attempts++;


    const elapsed =
      Math.round(
        (
          Date.now() -
          start
        ) / 1000
      );


    console.log(
      `[EMAIL] 🔎 Checking inbox... attempt ${attempts}, ${elapsed}s elapsed`
    );


    try {

      // --------------------------------------------------------
      // IMPORTANT:
      // Only lightweight matching headers are fetched here.
      // --------------------------------------------------------

      const emails =
        await fetchRecentEmailHeaders({

          limit:
            20,

          fromEmail:
            expectedSender,

          toEmail:
            targetEmail,

          subjectKeyword:
            expectedSubject,

          notBefore:
            notBefore,

        });


      let candidateFound =
        false;


      // --------------------------------------------------------
      // CHECK CANDIDATES
      // --------------------------------------------------------

      for (
        const mail of
          emails
      ) {

        const toMatch =
          emailRecipientMatches(
            mail,
            targetEmail
          );


        const subjectMatch =
          emailSubjectMatches(
            mail,
            expectedSubject
          );


        const senderMatch =
          expectedSender
            ? emailSenderMatches(
                mail,
                expectedSender
              )
            : true;


        const dateMatch =
          emailDateMatches(
            mail,
            notBefore
          );


        // ------------------------------------------------------
        // OLD / NON-MATCHING EMAIL:
        // IGNORE SILENTLY.
        // ------------------------------------------------------

        if (
          !toMatch ||
          !subjectMatch ||
          !senderMatch ||
          !dateMatch
        ) {

          continue;

        }


        candidateFound =
          true;


        // ------------------------------------------------------
        // MATCHING CURRENT EMAIL HEADER FOUND
        // ------------------------------------------------------

        console.log(
          '\n[EMAIL] ✅ Matching current checkout email found'
        );


        console.log(
          `[EMAIL] From    : ${
            mail.from?.text ||
            'N/A'
          }`
        );


        console.log(
          `[EMAIL] To      : ${
            mail.to?.text ||
            'N/A'
          }`
        );


        console.log(
          `[EMAIL] Subject : ${
            mail.subject ||
            'N/A'
          }`
        );


        console.log(
          `[EMAIL] Date    : ${
            mail.date ||
            'N/A'
          }`
        );


        // ------------------------------------------------------
        // FETCH COMPLETE CURRENT EMAIL ONLY
        // ------------------------------------------------------

        const fullMail =
          await fetchFullEmailByUid(
            mail._uid
          );


        // ------------------------------------------------------
        // FINAL STRICT VALIDATION
        // ------------------------------------------------------

        const finalToMatch =
          emailRecipientMatches(
            fullMail,
            targetEmail
          );


        const finalSubjectMatch =
          emailSubjectMatches(
            fullMail,
            expectedSubject
          );


        const finalSenderMatch =
          expectedSender
            ? emailSenderMatches(
                fullMail,
                expectedSender
              )
            : true;


        const finalDateMatch =
          emailDateMatches(
            fullMail,
            notBefore
          );


        if (
          finalToMatch &&
          finalSubjectMatch &&
          finalSenderMatch &&
          finalDateMatch
        ) {

          console.log(
            '\n[EMAIL] ✅ CURRENT CHECKOUT EMAIL VERIFIED'
          );


          // ----------------------------------------------------
          // ONLY CURRENT EMAIL DETAILS ARE PRINTED
          // ----------------------------------------------------

          await logEmailDetails(
            fullMail,
            `Current Checkout Confirmation: "${fullMail.subject}"`
          );


          return fullMail;

        }

      }


      if (
        !candidateFound
      ) {

        console.log(
          '[EMAIL] ⏳ Current checkout email not received yet...'
        );

      }

    } catch (error) {

      console.log(
        `[EMAIL] ⚠️ Warning: ${error.message}`
      );

    }


    // ----------------------------------------------------------
    // WAIT BEFORE NEXT POLL
    // ----------------------------------------------------------

    const remaining =
      timeout -
      (
        Date.now() -
        start
      );


    if (
      remaining <= 0
    ) {

      break;

    }


    const actualInterval =
      Math.min(
        pollInterval,
        Math.max(
          1000,
          remaining
        )
      );


    await sleep(
      actualInterval
    );

  }


  throw new Error(
    `Timeout waiting for current checkout email. ` +
    `Target="${targetEmail}", ` +
    `Sender="${expectedSender || 'ANY'}", ` +
    `Subject="${expectedSubject}", ` +
    `NotBefore="${notBefore || 'ANY DATE'}", ` +
    `Attempts=${attempts}`
  );

}


// ============================================================
// SLEEP
// ============================================================

function sleep(
  milliseconds
) {

  return new Promise(
    (
      resolve
    ) =>
      setTimeout(
        resolve,
        milliseconds
      )
  );

}


// ============================================================
// EXTRACT OTP
// ============================================================

function extractOTP(
  content
) {

  if (
    !content
  ) {

    return null;

  }


  const cleanText =
    String(
      content
    )
      .replace(
        /<style[\s\S]*?<\/style>/gi,
        ' '
      )
      .replace(
        /<script[\s\S]*?<\/script>/gi,
        ' '
      )
      .replace(
        /<[^>]+>/g,
        ' '
      )
      .replace(
        /&nbsp;/gi,
        ' '
      )
      .replace(
        /&amp;/gi,
        '&'
      )
      .replace(
        /&lt;/gi,
        '<'
      )
      .replace(
        /&gt;/gi,
        '>'
      )
      .replace(
        /&quot;/gi,
        '"'
      )
      .replace(
        /&#39;/gi,
        "'"
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();


  console.log(
    `[OTP DEBUG] Email content length: ${cleanText.length}`
  );


  // ==========================================================
  // STRICT CONTEXTUAL PATTERNS
  // ==========================================================

  const contextualPatterns = [

    /verification\s+(?:code|otp)\D{0,50}(\d{4,8})/i,

    /(?:your|the)\s+(?:verification\s+)?code\D{0,50}(\d{4,8})/i,

    /(?:otp|one[-\s]?time\s+(?:password|code))\D{0,50}(\d{4,8})/i,

    /\bcode\b\D{0,30}[:\-]?\s*(\d{4,8})/i,

  ];


  for (
    const pattern of
      contextualPatterns
  ) {

    const match =
      cleanText.match(
        pattern
      );


    if (
      match
    ) {

      console.log(
        `[OTP DEBUG] ✅ OTP found: ${match[1]}`
      );


      return match[1];

    }

  }


  // ==========================================================
  // FALLBACK
  // ==========================================================

  const matches =
    cleanText.match(
      /\b\d{4,8}\b/g
    );


  if (
    matches &&
    matches.length > 0
  ) {

    console.log(
      `[OTP DEBUG] ⚠️ OTP found using fallback: ${matches[0]}`
    );


    return matches[0];

  }


  console.log(
    '[OTP DEBUG] ❌ No OTP found'
  );


  return null;

}


// ============================================================
// WAIT FOR EMAIL WITH ANY SUBJECT
// ============================================================

async function waitForEmailWithAnySubject({

  subjectKeywords,

  toEmail,

  fromEmail = null,

  timeout = 120000,

  pollInterval = 5000,

  notBefore = null,

}) {

  if (
    !emailConfigured
  ) {

    throw new Error(
      'Email not configured. Set EMAIL_USER and EMAIL_PASS in .env'
    );

  }


  if (
    !Array.isArray(
      subjectKeywords
    ) ||
    subjectKeywords.length === 0
  ) {

    throw new Error(
      'subjectKeywords must contain at least one keyword'
    );

  }


  if (
    !toEmail
  ) {

    throw new Error(
      'toEmail is required'
    );

  }


  const start =
    Date.now();


  let attempts =
    0;


  const targetEmail =
    normalizeEmail(
      toEmail
    );


  const expectedSender =
    fromEmail
      ? normalizeEmail(
          fromEmail
        )
      : null;


  console.log(
    `\n[EMAIL] Target inbox recipient: ${targetEmail}`
  );


  while (
    Date.now() - start <
    timeout
  ) {

    attempts++;


    console.log(
      `[EMAIL] 🔎 Checking inbox... attempt ${attempts}`
    );


    try {

      const emails =
        await fetchLatestEmails(
          20
        );


      for (
        const mail of
          emails
      ) {

        const toMatch =
          emailRecipientMatches(
            mail,
            targetEmail
          );


        if (
          !toMatch
        ) {

          continue;

        }


        if (
          expectedSender &&
          !emailSenderMatches(
            mail,
            expectedSender
          )
        ) {

          continue;

        }


        const dateMatch =
          emailDateMatches(
            mail,
            notBefore
          );


        if (
          !dateMatch
        ) {

          continue;

        }


        const mailSubject =
          normalizeSubject(
            mail.subject
          );


        const matchedKeyword =
          subjectKeywords.find(
            (
              keyword
            ) =>
              mailSubject.includes(
                normalizeSubject(
                  keyword
                )
              )
          );


        if (
          !matchedKeyword
        ) {

          continue;

        }


        console.log(
          '[EMAIL] ✅ Email found'
        );


        console.log(
          `[EMAIL] Matched keyword: "${matchedKeyword}"`
        );


        await logEmailDetails(
          mail,
          `Keyword: "${matchedKeyword}"`
        );


        return mail;

      }

    } catch (error) {

      console.log(
        `[EMAIL] ⚠️ Warning: ${error.message}`
      );

    }


    const remaining =
      timeout -
      (
        Date.now() -
        start
      );


    if (
      remaining <= 0
    ) {

      break;

    }


    await sleep(
      Math.min(
        pollInterval,
        remaining
      )
    );

  }


  throw new Error(
    `Timeout waiting for email. ` +
    `Keywords="${subjectKeywords.join(', ')}", ` +
    `To="${targetEmail}"` +
    (
      expectedSender
        ? `, From="${expectedSender}"`
        : ''
    )
  );

}


// ============================================================
// HTML -> TEXT
// ============================================================

function htmlToText(
  html
) {

  return String(
    html || ''
  )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      ''
    )
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      ''
    )
    .replace(
      /<br\s*\/?>/gi,
      '\n'
    )
    .replace(
      /<\/p>/gi,
      '\n'
    )
    .replace(
      /<\/div>/gi,
      '\n'
    )
    .replace(
      /<\/li>/gi,
      '\n'
    )
    .replace(
      /<\/h[1-6]>/gi,
      '\n'
    )
    .replace(
      /<[^>]+>/g,
      ''
    )
    .replace(
      /&amp;/gi,
      '&'
    )
    .replace(
      /&lt;/gi,
      '<'
    )
    .replace(
      /&gt;/gi,
      '>'
    )
    .replace(
      /&quot;/gi,
      '"'
    )
    .replace(
      /&#39;/gi,
      "'"
    )
    .replace(
      /&nbsp;/gi,
      ' '
    )
    .replace(
      /&mdash;/gi,
      '—'
    )
    .replace(
      /&ndash;/gi,
      '–'
    )
    .replace(
      /\n{3,}/g,
      '\n\n'
    )
    .trim();

}


// ============================================================
// LOG EMAIL DETAILS
// ============================================================

async function logEmailDetails(
  email,
  label
) {

  console.log(
    '\n╔══════════════════════════════════════════════════════════════╗'
  );


  console.log(
    `║ EMAIL FOUND — ${label}`
  );


  console.log(
    '╠══════════════════════════════════════════════════════════════╣'
  );


  console.log(
    `║ Subject : ${
      email?.subject ||
      'N/A'
    }`
  );


  console.log(
    `║ From    : ${
      email?.from?.text ||
      email?.from ||
      'N/A'
    }`
  );


  console.log(
    `║ To      : ${
      email?.to?.text ||
      email?.to ||
      'N/A'
    }`
  );


  console.log(
    `║ Date    : ${
      email?.date ||
      'N/A'
    }`
  );


  if (
    email?.cc?.text
  ) {

    console.log(
      `║ CC      : ${email.cc.text}`
    );

  }


  if (
    email?.replyTo?.text
  ) {

    console.log(
      `║ ReplyTo : ${email.replyTo.text}`
    );

  }


  console.log(
    '╠══════════════════════════════════════════════════════════════╣'
  );


  // ==========================================================
  // TEXT BODY
  // ==========================================================

  const bodyText =
    String(
      email?.text ||
      ''
    ).trim();


  if (
    bodyText
  ) {

    console.log(
      '║ BODY (text/plain):'
    );


    for (
      const line of
        bodyText.split(
          '\n'
        )
    ) {

      console.log(
        `║   ${line.substring(0, 90)}`
      );

    }

  }


  // ==========================================================
  // HTML BODY
  // ==========================================================

  const bodyHtml =
    String(
      email?.html ||
      ''
    ).trim();


  if (
    bodyHtml
  ) {

    if (
      bodyText
    ) {

      console.log(
        '╠══════════════════════════════════════════════════════════════╣'
      );

    }


    const stripped =
      htmlToText(
        bodyHtml
      );


    console.log(
      '║ BODY (HTML stripped):'
    );


    for (
      const line of
        stripped.split(
          '\n'
        )
    ) {

      const trimmed =
        line.trim();


      if (
        trimmed
      ) {

        console.log(
          `║   ${trimmed.substring(0, 90)}`
        );

      }

    }

  }


  // ==========================================================
  // EMPTY BODY
  // ==========================================================

  if (
    !bodyText &&
    !bodyHtml
  ) {

    console.log(
      '║ BODY: empty'
    );


    console.log(
      `║ text length: ${
        (email?.text || '').length
      }`
    );


    console.log(
      `║ html length: ${
        (email?.html || '').length
      }`
    );

  }


  // ==========================================================
  // ATTACHMENTS
  // ==========================================================

  if (
    email?.attachments &&
    email.attachments.length > 0
  ) {

    console.log(
      '╠══════════════════════════════════════════════════════════════╣'
    );


    console.log(
      `║ ATTACHMENTS: ${email.attachments.length}`
    );


    for (
      const attachment of
        email.attachments
    ) {

      console.log(
        `║ - ${
          attachment.filename ||
          'unnamed'
        }`
      );


      if (
        attachment.contentType
      ) {

        console.log(
          `║   Type : ${attachment.contentType}`
        );

      }


      if (
        Number.isFinite(
          attachment.size
        )
      ) {

        console.log(
          `║   Size : ${attachment.size} bytes`
        );

      }

    }

  }


  console.log(
    '╚══════════════════════════════════════════════════════════════╝\n'
  );

}


// ============================================================
// EMAIL CONFIG STATUS
// ============================================================

function isEmailConfigured() {

  return emailConfigured;

}


// ============================================================
// GET EMAIL CONFIG STATUS
// ============================================================

function getEmailConfigStatus() {

  return {

    configured:
      emailConfigured,

    hasUser:
      Boolean(
        process.env.EMAIL_USER
      ),

    hasPassword:
      Boolean(
        process.env.EMAIL_PASS
      ),

    user:
      process.env.EMAIL_USER ||
      null,

    host:
      imapConfig.host,

    port:
      imapConfig.port,

  };

}


// ============================================================
// EXPORTS
// ============================================================

module.exports = {

  waitForEmail,

  waitForEmailWithAnySubject,

  extractOTP,

  logEmailDetails,

  isEmailConfigured,

  getEmailConfigStatus,

  fetchLatestEmails,

  emailRecipientMatches,

  emailSenderMatches,

  emailSubjectMatches,

  emailDateMatches,

};

