import Validator, { RacingCarGameError } from "./Validator";
import Cars from "./Cars";
import RacingGameViewer from "./RacingGameViewer";

const CAR_NAME_INPUT_GUIDE =
  "경주할 자동차 이름을 입력하세요(이름은 쉼표(,)를 기준으로 구분).\n";

const RACING_ROUND_INPUT_GUIDE = "시도할 회수는 몇회인가요?\n";

const CAR_NAME_SEPARATOR = ",";

const GAME_STEP = {
  SET_CARS: "SET_CARS",
  SET_ROUND_NUMBER: "SET_ROUND_NUMBER",
  EXECUTE_ROUND: "EXECUTE_ROUND",
  AWARDS: "AWARDS",
};

export default class RacingGameController {
  model;
  view;
  nextGameStep;

  constructor() {
    this.view = new RacingGameViewer();
    this.model = new Cars();
    this.nextGameStep = GAME_STEP.SET_CARS;
  }

  async handleError(error) {
    if (error instanceof RacingCarGameError) {
      this.view.printContent(error.message);

      await this.runGame();
    }
  }

  async requestCarNames() {
    const userInput = await this.view.getUserInput(CAR_NAME_INPUT_GUIDE);

    const carNames = userInput.split(CAR_NAME_SEPARATOR);

    Validator.validateCarNames(carNames);

    return carNames;
  }

  async requestRoundNumber() {
    const userInput = await this.view.getUserInput(RACING_ROUND_INPUT_GUIDE);

    Validator.validateRoundNumber(userInput);

    return Number(userInput);
  }

  exitGame() {
    this.view.closeViewer();
  }

  async setCars() {
    const carNames = await this.requestCarNames();

    carNames.forEach((car) => this.model.addCar(car));
  }

  async setRoundNumber() {
    const roundNumber = await this.requestRoundNumber();

    this.model.setRoundNumber(roundNumber);
  }

  afterRoundAction = (carStatus) => {
    this.view.printCarStatus(carStatus);
  };

  async runGame() {
    try {
      if (this.nextGameStep === GAME_STEP.SET_CARS) {
        await this.setCars();
        this.nextGameStep = GAME_STEP.SET_ROUND_NUMBER;
      }

      if (this.nextGameStep === GAME_STEP.SET_ROUND_NUMBER) {
        await this.setRoundNumber();
        this.nextGameStep = GAME_STEP.EXECUTE_ROUND;
      }

      this.view.printRoundHeader();
      this.model.executeMultipleRounds(this.afterRoundAction);
      this.nextGameStep = GAME_STEP.AWARDS;

      const winners = this.model.getWinners();
      this.view.printWinners(winners);
    } catch (e) {
      await this.handleError(e);
    } finally {
      this.exitGame();
    }
  }
}
