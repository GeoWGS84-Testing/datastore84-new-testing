 import { test, expect } from './common';

import { HomePage } from '../pages/HomePage';

import { MapPage } from '../pages/MapPage';

import path from 'path';

import { runSatelliteServiceTest } from '../utils/satellitTesthelper';

import { runSecondSatelliteServiceTest } from '../utils/satelliteSecondTestHelper';

import { runThirdSatelliteServiceTest } from '../utils/satelliteThirdTestHelper';

import {
  clearDiagnostics,
  showStep,
  logInfo,
  addWarning,
  addError,
  saveMapScreenshot,
  fastWait,
  robustClick,
  highlight,
} from '../utils/helpers';

test.use({
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'on',
});

 


// ============================================================
// TC-1 - SATELLITE SERVICE - WORLDVIEW02
// ============================================================

test(
  '[P0] 1 - Satellite Service worldview02',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 1,
        satelliteName: 'WorldView02',
        satelliteValue: 'WorldView02',
      }
    );

  }
);


// ============================================================
// TC-2 - SATELLITE SERVICE - WORLDVIEW03
// ============================================================

test(
  '[P0] 2 - Satellite Service worldview03',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 2,
        satelliteName: 'WorldView03',
        satelliteValue: 'WorldView03',
      }
    );

  }
);


// ============================================================
// TC-3 - SATELLITE SERVICE - WORLDVIEW04
// ============================================================

test(
  '[P0] 3 - Satellite Service worldview04',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 3,
        satelliteName: 'WorldView04',
        satelliteValue: 'WorldView04',
      }
    );

  }
);


// ============================================================
// TC-4 - SATELLITE SERVICE - WORLDVIEW01
// ============================================================

test(
  '[P0] 4 - Satellite Service worldview01',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 4,
        satelliteName: 'WorldView01',
        satelliteValue: 'WorldView01',
      }
    );

  }
);


// ============================================================
// TC-5 - SATELLITE SERVICE - WV-LEGION01
// ============================================================

test(
  '[P0] 5 - Satellite Service WV-Legion01',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 5,
        satelliteName: 'WV-Legion01',
        satelliteValue: 'WV-Legion01',
      }
    );

  }
);


// ============================================================
// TC-6 - SATELLITE SERVICE - WV-LEGION02
// ============================================================

test(
  '[P0] 6 - Satellite Service WV-Legion02',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 6,
        satelliteName: 'WV-Legion02',
        satelliteValue: 'WV-Legion02',
      }
    );

  }
);

// ============================================================
// TC-7 - SATELLITE SERVICE - GEOEYE1
// ============================================================

test(
  '[P0] 7 - Satellite Service GeoEye1',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 7,
        satelliteName: 'GeoEye1',
        satelliteValue: 'GeoEye1',
      }
    );

  }
);


// ============================================================
// TC-8 - SATELLITE SERVICE - QUICKBIRD
// ============================================================

test(
  '[P0] 8 - Satellite Service QuickBird',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 8,
        satelliteName: 'QuickBird',
        satelliteValue: 'QuickBird',
      }
    );

  }
);


// ============================================================
// TC-9 - SATELLITE SERVICE - IKONOS
// ============================================================

test(
  '[P0] 9 - Satellite Service IKONOS',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 9,
        satelliteName: 'IKONOS',
        satelliteValue: 'IKONOS',
      }
    );

  }
);

 

// ============================================================
// TC-10 - SATELLITE SERVICE - 21AT 30CM ARCHIVE
// ============================================================

test(
  '[P0] 10 - Satellite Service 21AT 30cm Archive',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 10,
        satelliteName: '21AT 30cm Archive',
        satelliteValue: '21AT 30cm Archive',
      }
    );

  }
);


// ============================================================
// TC-11 - SATELLITE SERVICE - 21AT 80CM ARCHIVE
// ============================================================

test(
  '[P0] 11 - Satellite Service 21AT 80cm Archive',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 11,
        satelliteName: '21AT 80cm Archive',
        satelliteValue: '21AT 80cm Archive',
      }
    );

  }
);

// ============================================================
// TC-12 - SATELLITE SERVICE - OSE-GF01(0.5m)
// ============================================================

test(
  '[P0] 12 - Satellite Service OSE-GF01(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 12,
        satelliteName: 'OSE-GF01(0.5m)',
        satelliteValue: 'TV:8',
      }
    );

  }
);


// ============================================================
// TC-13 - SATELLITE SERVICE - JL1KF01B(0.5m)
// ============================================================

test(
  '[P0] 13 - Satellite Service JL1KF01B(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 13,
        satelliteName: 'JL1KF01B(0.5m)',
        satelliteValue: 'TV:306',
      }
    );

  }
);


// ============================================================
// TC-14 - SATELLITE SERVICE - JL1KF01C(0.5m)
// ============================================================

test(
  '[P0] 14 - Satellite Service JL1KF01C(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 18,
        satelliteName: 'JL1KF01C(0.5m)',
        satelliteValue: 'TV:307',
      }
    );

  }
);


// ============================================================
// TC-15 - SATELLITE SERVICE - JL1KF02B01(0.5m)
// ============================================================

test(
  '[P0] 15 - Satellite Service JL1KF02B01(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 15,
        satelliteName: 'JL1KF02B01(0.5m)',
        satelliteValue: 'TV:309',
      }
    );

  }
);


// ============================================================
// TC-16 - SATELLITE SERVICE - JL1KF02B02(0.5m)
// ============================================================

test(
  '[P0] 16 - Satellite Service JL1KF02B02(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 16,
        satelliteName: 'JL1KF02B02(0.5m)',
        satelliteValue: 'TV:310',
      }
    );

  }
);


// ============================================================
// TC-17 - SATELLITE SERVICE - JL1KF02B03(0.5m)
// ============================================================

test(
  '[P0] 17 - Satellite Service JL1KF02B03(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 17,
        satelliteName: 'JL1KF02B03(0.5m)',
        satelliteValue: 'TV:311',
      }
    );

  }
);


// ============================================================
// TC-18 - SATELLITE SERVICE - JL1KF02B07(0.5m)
// ============================================================

test(
  '[P0] 18 - Satellite Service JL1KF02B07(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 18,
        satelliteName: 'JL1KF02B07(0.5m)',
        satelliteValue: 'TV:315',
      }
    );

  }
);

 // ============================================================
// TC-19 - SECOND SATELLITE SERVICE - 21AT TASKING
// ============================================================

test(
  '[P0] 19 - Satellite Service 21AT Tasking',
  async ({ page }, testInfo) => {

    await runSecondSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 19,
        satelliteName: '21AT Tasking',
        satelliteValue: '21AT Tasking',
      }
    );

  }
);


// ============================================================
// TC-20 - SECOND SATELLITE SERVICE - SATELLOGIC
// ============================================================

test(
  '[P0] 20 - Satellite Service Satellogic',
  async ({ page }, testInfo) => {

    await runSecondSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 20,
        satelliteName: 'Satellogic',
        satelliteValue: 'Satellogic',
      }
    );

  }
);


// ============================================================
// TC-21 - SECOND SATELLITE SERVICE - EOS SAT-1 1.5m ARCHIVE
// ============================================================

test(
  '[P0] 21 - Satellite Service EOS SAT-1 1.5m Archive',
  async ({ page }, testInfo) => {

    await runSecondSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 21,
        satelliteName: 'EOS SAT-1 1.5m Archive',
        satelliteValue: 'EOS SAT-1 1.5m Archive',
      }
    );

  }
);


// ============================================================
// TC-22 - SECOND SATELLITE SERVICE - EOS SAT-1 1.5m TASKING
// ============================================================

test(
  '[P0] 22 - Satellite Service EOS SAT-1 1.5m Tasking',
  async ({ page }, testInfo) => {

    await runSecondSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 22,
        satelliteName: 'EOS SAT-1 1.5m Tasking',
        satelliteValue: 'EOS SAT-1 1.5m Tasking',
      }
    );

  }
);


// ============================================================
// TC-23 - SATELLITE SERVICE - KOMPSAT-2
// ============================================================

test(
  '[P0] 23 - Satellite Service Kompsat-2',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 23,
        satelliteName: 'Kompsat-2',
        satelliteValue: 'Kompsat-2',
      }
    );

  }
);


// ============================================================
// TC-24 - SATELLITE SERVICE - KOMPSAT-3
// ============================================================

test(
  '[P0] 24 - Satellite Service Kompsat-3',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 24,
        satelliteName: 'Kompsat-3',
        satelliteValue: 'Kompsat-3',
      }
    );

  }
);


// ============================================================
// TC-25 - SATELLITE SERVICE - KOMPSAT-3A
// ============================================================

test(
  '[P0] 25 - Satellite Service Kompsat-3a',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 25,
        satelliteName: 'Kompsat-3a',
        satelliteValue: 'Kompsat-3a',
      }
    );

  }
);


// ============================================================
// TC-26 - SATELLITE SERVICE - 21AT 50CM ARCHIVE
// ============================================================

test(
  '[P0] 26 - Satellite Service 21AT 50cm Archive',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 26,
        satelliteName: '21AT 50cm Archive',
        satelliteValue: '21AT 50cm Archive',
      }
    );

  }
);

 
// ============================================================
// TC-27 - SATELLITE SERVICE - OSE-GF01
// ============================================================

test(
  '[P0] 27 - Satellite Service OSE-GF01(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 27,
        satelliteName: 'OSE-GF01(0.5m)',
        satelliteValue: 'TV:8',
      }
    );

  }
);


// ============================================================
// TC-28 - SATELLITE SERVICE - OSE-HS01
// ============================================================

test(
  '[P0] 28 - Satellite Service OSE-HS01(5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 28,
        satelliteName: 'OSE-HS01(5m)',
        satelliteValue: 'TV:327',
      }
    );

  }
);


// ============================================================
// TC-29 - SATELLITE SERVICE - OSE-HS02
// ============================================================

test(
  '[P0] 29 - Satellite Service OSE-HS02(5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 29,
        satelliteName: 'OSE-HS02(5m)',
        satelliteValue: 'TV:328',
      }
    );

  }
);


// ============================================================
// TC-30 - SATELLITE SERVICE - BJ3A
// ============================================================

test(
  '[P0] 30 - Satellite Service BJ3A(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 30,
        satelliteName: 'BJ3A(0.5m)',
        satelliteValue: 'TV:4',
      }
    );

  }
);


// ============================================================
// TC-31 - SATELLITE SERVICE - BJ2
// ============================================================

test(
  '[P0] 31 - Satellite Service BJ2(0.8m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 31,
        satelliteName: 'BJ2(0.8m)',
        satelliteValue: 'TV:305',
      }
    );

  }
);


// ============================================================
// TC-32 - SATELLITE SERVICE - SV-2
// ============================================================

test(
  '[P0] 32 - Satellite Service SV-2(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 32,
        satelliteName: 'SV-2(0.5m)',
        satelliteValue: 'TV:7605',
      }
    );

  }
);


// ============================================================
// TC-33 - SATELLITE SERVICE - SV1A
// ============================================================

test(
  '[P0] 33 - Satellite Service SV1A(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 33,
        satelliteName: 'SV1A(0.5m)',
        satelliteValue: 'TV:7740',
      }
    );

  }
);


// ============================================================
// TC-34 - SATELLITE SERVICE - SV1B
// ============================================================

test(
  '[P0] 34 - Satellite Service SV1B(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 34,
        satelliteName: 'SV1B(0.5m)',
        satelliteValue: 'TV:7812',
      }
    );

  }
);


// ============================================================
// TC-35 - SATELLITE SERVICE - SV1C
// ============================================================

test(
  '[P0] 35 - Satellite Service SV1C(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 35,
        satelliteName: 'SV1C(0.5m)',
        satelliteValue: 'TV:7813',
      }
    );

  }
);


// ============================================================
// TC-36 - SATELLITE SERVICE - SV1D
// ============================================================

test(
  '[P0] 36 - Satellite Service SV1D(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 36,
        satelliteName: 'SV1D(0.5m)',
        satelliteValue: 'TV:7814',
      }
    );

  }
);


// ============================================================
// TC-37 - SATELLITE SERVICE - SVN3-01
// ============================================================

test(
  '[P0] 37 - Satellite Service SVN3-01(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 37,
        satelliteName: 'SVN3-01(0.5m)',
        satelliteValue: 'TV:7840',
      }
    );

  }
);


// ============================================================
// TC-38 - SATELLITE SERVICE - SVN3-02
// ============================================================

test(
  '[P0] 38 - Satellite Service SVN3-02(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 38,
        satelliteName: 'SVN3-02(0.5m)',
        satelliteValue: 'TV:9935',
      }
    );

  }
);


// ============================================================
// TC-39 - SATELLITE SERVICE - JL1KF02A
// ============================================================

test(
  '[P0] 39 - Satellite Service JL1KF02A(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 39,
        satelliteName: 'JL1KF02A(0.5m)',
        satelliteValue: 'TV:308',
      }
    );

  }
);


// ============================================================
// TC-40 - SATELLITE SERVICE - JL1KF02B04
// ============================================================

test(
  '[P0] 40 - Satellite Service JL1KF02B04(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 40,
        satelliteName: 'JL1KF02B04(0.5m)',
        satelliteValue: 'TV:312',
      }
    );

  }
);


// ============================================================
// TC-41 - SATELLITE SERVICE - JL1KF02B05
// ============================================================

test(
  '[P0] 41 - Satellite Service JL1KF02B05(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 41,
        satelliteName: 'JL1KF02B05(0.5m)',
        satelliteValue: 'TV:313',
      }
    );

  }
);


// ============================================================
// TC-42 - SATELLITE SERVICE - JL1KF02B06
// ============================================================

test(
  '[P0] 42 - Satellite Service JL1KF02B06(0.5m)',
  async ({ page }, testInfo) => {

    await runThirdSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 42,
        satelliteName: 'JL1KF02B06(0.5m)',
        satelliteValue: 'TV:314',
      }
    );

  }
);
  

// ============================================================
// TC-43 - SATELLITE SERVICE - LJ3II(0.5m)
// ============================================================

test(
  '[P0] 43 - Satellite Service LJ3II(0.5m)',
  async ({ page }, testInfo) => {

    await runSatelliteServiceTest(
      page,
      testInfo,
      {
        testNumber: 43,
        satelliteName: 'LJ3II(0.5m)',
        satelliteValue: 'TV:315',
      }
    );

  }
);


 //  npx playwright test specs/satellite.spec.js -g "\[P0\] 1" --headed --workers=1
 //  npx playwright test specs/satellite.spec.js -g "\[P0\] (19|20|21|22)" --headed --workers=1
 