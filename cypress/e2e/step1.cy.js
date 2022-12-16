import {
  HAS_SAME_CAR_NAME_MESSAGE,
  INVALID_CAR_NAME_MESSAGE,
  INVALID_RACING_COUNT_MESSAGE,
  MIN_RACING_COUNT,
} from '../../src/js/constants.js';
import { getCarNames } from '../../src/js/utils/getCarNames.js';

describe('자동차 경주 게임 step1 ', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  const getCarNamesInput = () => cy.get('#carNamesInput');
  const getCarNamesSubmit = () => cy.get('#carNamesSubmit');
  const getRacingCountForm = () => cy.get('#racingCountForm');
  const getRacingCountInput = () => cy.get('#racingCountInput');
  const getRacingCountSubmit = () => cy.get('#racingCountSubmit');
  const getRacingCars = () => cy.get('.car-player');

  const getAlertObj = () => {
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);
    return alertStub;
  };

  describe('자동차에 이름을 부여할 수 있다.', () => {
    it('자동차 이름을 입력할 input이 존재한다.', () => {
      getCarNamesInput().should('exist');
      getCarNamesInput().should('be.visible');
    });
    it('자동차에 부여한 이름을 제출할 버튼이 존재한다.', () => {
      getCarNamesSubmit().should('exist');
      getCarNamesSubmit().should('be.visible');
    });
  });

  describe('자동차 이름은 쉼표를 기준으로 구분한다. 이름은 5자 이하만 가능하다.', () => {
    it(`자동차이름은 1자 미만(공백)으로 입력한 뒤 제출하면 ${INVALID_CAR_NAME_MESSAGE}라는 경고를 띄운다.`, () => {
      const alert = getAlertObj();
      getCarNamesInput().type(' ');
      getCarNamesSubmit()
        .click()
        .then(() => {
          const actualMessage = alert.getCall(0).lastArg;
          expect(actualMessage).to.equal(INVALID_CAR_NAME_MESSAGE);
        });
    });
    it('자동차이름은 5자 이상으로 입력한 뒤 제출하면 경고창을 띄운다.', () => {
      const alert = getAlertObj();
      getCarNamesInput().type('123456');
      getCarNamesSubmit()
        .click()
        .then(() => {
          const actualMessage = alert.getCall(0).lastArg;
          expect(actualMessage).to.equal(INVALID_CAR_NAME_MESSAGE);
        });
    });
    it('getCarNames 함수에 쉼표가 포함된 이름을 입력하면, 쉼표로 구분하여 이름을 추출한다.', () => {
      const inputValue = '12, 3 4, 5,6';
      const carNames = getCarNames(inputValue);
      expect(carNames.length).to.equal(4);
    });
    it('쉼표 이후 자동차 이름이 없이 공백인 경우, 경고창을 띄운다.', () => {
      const alert = getAlertObj();
      getCarNamesInput().type('12, ');
      getCarNamesSubmit()
        .click()
        .then(() => {
          const actualMessage = alert.getCall(0).lastArg;
          expect(actualMessage).to.equal(INVALID_CAR_NAME_MESSAGE);
        });
    });
    it(`중복된 이름을 입력한 경우, ${HAS_SAME_CAR_NAME_MESSAGE}라는 경고창을 띄운다.`, () => {
      const alert = getAlertObj();
      getCarNamesInput().type('1, 12, 1 2');
      getCarNamesSubmit()
        .click()
        .then(() => {
          const actualMessage = alert.getCall(0).lastArg;
          expect(actualMessage).to.equal(HAS_SAME_CAR_NAME_MESSAGE);
        });
    });

    it('자동차이름을 정상적으로 입력한 뒤 제출하면 이동 횟수 입력 폼을 띄운다.', () => {
      getCarNamesInput().type('123, 456, 789');
      getCarNamesSubmit()
        .click()
        .then(() => {
          getRacingCountForm().should('exist');
          getRacingCountForm().should('be.visible');
        });
    });
  });

  describe('사용자는 몇 번의 이동을 할 것인지 입력할 수 있다.', () => {
    beforeEach(() => {
      getCarNamesInput().type('123, 456, 789');
      getCarNamesSubmit().click();
    });

    it('자동차 이름을 입력하고 확인 버튼을 누르면 해당 버튼이 비활성화 된다.', () => {
      getCarNamesSubmit().should('be.disabled');
    });

    it('자동차 이름을 입력하고 확인 버튼을 누르면 이동 횟수를 부여할 input과 이를 제출할 버튼이 존재한다.', () => {
      getRacingCountInput().should('exist');
      getRacingCountInput().should('be.visible');
      getRacingCountSubmit().should('exist');
      getRacingCountSubmit().should('be.visible');
    });

    it('이동 횟수 입력에는 숫자만 입력이 가능하다.', () => {
      getRacingCountInput().type('10a').should('have.value', '10');
      getRacingCountInput().clear();
      getRacingCountInput().type('abc').should('have.value', '');
    });

    it(`이동 횟수 입력은 ${MIN_RACING_COUNT}부터 입력이 가능하다.`, () => {
      getRacingCountInput().type('1').should('have.value', MIN_RACING_COUNT);
    });

    it(`이동 횟수는 반드시 입력해야 하며, 공백 혹은 0을 입력하고 확인 버튼 클릭 시, ${INVALID_RACING_COUNT_MESSAGE}라는 경고창을 호출한다.`, () => {
      const alert = getAlertObj();
      getRacingCountInput().type(' ');
      getRacingCountSubmit()
        .click()
        .then(() => {
          const actualMessage = alert.getCall(0).lastArg;
          expect(actualMessage).to.equal(INVALID_RACING_COUNT_MESSAGE);
        });
      getRacingCountInput().clear();
      getRacingCountInput().type('0');
      getRacingCountSubmit()
        .click()
        .then(() => {
          const actualMessage = alert.getCall(0).lastArg;
          expect(actualMessage).to.equal(INVALID_RACING_COUNT_MESSAGE);
        });
    });
  });

  describe('전진하는 자동차를 출력할 때 자동차 이름을 같이 출력한다.', () => {
    it('이름과 이동회수를 제출하면, 기입한 자동차의 이름이 출력되어야 한다.', () => {
      getCarNamesInput().type('one, two, three');
      getCarNamesSubmit().click();
      getRacingCountInput().type('1');
      getRacingCountSubmit().click();
      getRacingCars().should('have.length', '3');
      getRacingCars().eq(0).should('contain', 'one');
      getRacingCars().eq(1).should('contain', 'two');
      getRacingCars().eq(2).should('contain', 'three');
    });
  });

  describe('주어진 횟수 동안 n대의 자동차는 전진 또는 멈출 수 있다.', () => {
    it('전진한 자동차는 화살표가 표시된다', () => {
      getCarNamesInput().type('one, two, three');
      getCarNamesSubmit().click();
      getRacingCountInput().type('3');
      getRacingCountSubmit().click();
      cy.get('.forward-icon').should('exist');
    });
    it('멈춘 자동차는 스피너가 표시된다', () => {
      getCarNamesInput().type('one, two, three');
      getCarNamesSubmit().click();
      getRacingCountInput().type('3');
      getRacingCountSubmit().click();
      cy.get('.spinner').should('exist');
    });
  });
});
