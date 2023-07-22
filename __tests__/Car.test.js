import * as readline from "readline";
import RacingCarGame from "../src/class/RacingCarGame";
import { EventEmitter } from "stream";
import {
  ERROR_MESSAGES,
  NO_WINNER_MESSAGE,
  WINNER_ANNOUNCEMENT_MESSAGE,
} from "../src/data/constants";

jest.mock("readline");

function initiallizeTestEnvironment() {
  const questionSpy = jest.fn();
  const closeSpy = jest.fn();
  const consoleLogSpy = jest.spyOn(console, "log");

  readline.createInterface.mockReturnValue({
    question: questionSpy,
    close: closeSpy,
    input: new EventEmitter(),
    output: new EventEmitter(),
    write: jest.fn(),
  });

  const racingCarGame = new RacingCarGame();

  return { questionSpy, racingCarGame, closeSpy, consoleLogSpy };
}

describe("레이싱 경주 시작 및 자동차 이름 입력", () => {
  test("레이싱 경주 시작시 안내문구가 콘솔에 표시된다", () => {
    const { racingCarGame, questionSpy } = initiallizeTestEnvironment();

    racingCarGame.startGame();

    expect(questionSpy).toHaveBeenCalledWith(
      "경주할 자동차 이름을 입력하세요(이름은 쉼표(,)를 기준으로 구분).\n",
      expect.anything()
    );
  });

  test("endGame 메소드 호출 시 경주가 정상적으로 종료된다.", () => {
    const { racingCarGame, closeSpy } = initiallizeTestEnvironment();

    racingCarGame.startGame();

    racingCarGame.endGame();

    expect(closeSpy).toHaveBeenCalled();
  });

  test("자동차 이름에 빈값을 입력할 경우 에러 문구와 함께 게임이 종료된다.", () => {
    const { racingCarGame, closeSpy, consoleLogSpy } =
      initiallizeTestEnvironment();

    readline
      .createInterface()
      .question.mockImplementationOnce((_, callback) => callback(""));

    racingCarGame.startGame();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      ERROR_MESSAGES.INVALID_EMPTY_NAME
    );

    expect(closeSpy).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });

  test("여러 자동차 이름에 빈값이 포함되어 있는 경우 에러 문구와 함께 게임이 종료된다.", () => {
    const { racingCarGame, closeSpy, consoleLogSpy } =
      initiallizeTestEnvironment();

    readline
      .createInterface()
      .question.mockImplementationOnce((_, callback) =>
        callback("pobi,  ,conan")
      );

    racingCarGame.startGame();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      ERROR_MESSAGES.INVALID_EMPTY_NAME
    );

    expect(closeSpy).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });

  test("여러 자동차 이름에 5자가 넘는 자동차 이름이 포함되어 있는 경우 에러 문구와 함께 게임이 종료된다.", () => {
    const { racingCarGame, closeSpy, consoleLogSpy } =
      initiallizeTestEnvironment();

    readline
      .createInterface()
      .question.mockImplementationOnce((_, callback) =>
        callback("1234567,pobi,conan")
      );

    racingCarGame.startGame();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      ERROR_MESSAGES.INVALID_NAME_LENGTH
    );

    expect(closeSpy).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });

  test("중복된 자동차 이름이 포함되어 있는 경우 에러 문구와 함께 게임이 종료된다.", () => {
    const { racingCarGame, closeSpy, consoleLogSpy } =
      initiallizeTestEnvironment();

    readline
      .createInterface()
      .question.mockImplementationOnce((_, callback) =>
        callback("pobi,pobi,conan")
      );

    racingCarGame.startGame();

    expect(consoleLogSpy).toHaveBeenCalledWith(
      ERROR_MESSAGES.DUPLICATE_CAR_NAME
    );

    expect(closeSpy).toHaveBeenCalledTimes(1);

    consoleLogSpy.mockRestore();
  });

  test("정상적인 자동차 이름 입력시 cars에 정보가 저장된다.(settingCars 메소드 테스트)", () => {
    const { racingCarGame } = initiallizeTestEnvironment();

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    const expectedCars = new Map();

    expectedCars.set("pobi", { distance: 0 });

    expectedCars.set("crong", { distance: 0 });

    expectedCars.set("honux", { distance: 0 });

    expect(racingCarGame.cars).toEqual(expectedCars);
  });
});

describe("레이싱 경주 진행", () => {
  test("전진할 경우 distance가 1 증가한다.", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy.mockReturnValue(true);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.executeOneRound();

    const expectedCars = new Map();

    expectedCars.set("pobi", { distance: 1 });

    expectedCars.set("crong", { distance: 1 });

    expectedCars.set("honux", { distance: 1 });

    expect(racingCarGame.cars).toEqual(expectedCars);

    consoleLogSpy.mockRestore();
  });

  test("전진하지 못하는 경우 distance가 그대로 유지된다.", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy.mockReturnValue(false);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.executeOneRound();

    const expectedCars = new Map();

    expectedCars.set("pobi", { distance: 0 });

    expectedCars.set("crong", { distance: 0 });

    expectedCars.set("honux", { distance: 0 });

    expect(racingCarGame.cars).toEqual(expectedCars);

    checkForAdvanceSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  test("distance의 값에 맞도록 경주 상태가 출력된다", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.executeOneRound();
    racingCarGame.executeOneRound();
    racingCarGame.executeOneRound();

    expect(consoleLogSpy).toHaveBeenNthCalledWith(1, "pobi : ");
    expect(consoleLogSpy).toHaveBeenNthCalledWith(2, "crong : ");
    expect(consoleLogSpy).toHaveBeenNthCalledWith(3, "honux : ");

    expect(consoleLogSpy).toHaveBeenNthCalledWith(5, "pobi : ");
    expect(consoleLogSpy).toHaveBeenNthCalledWith(6, "crong : ");
    expect(consoleLogSpy).toHaveBeenNthCalledWith(7, "honux : -");

    expect(consoleLogSpy).toHaveBeenNthCalledWith(9, "pobi : ");
    expect(consoleLogSpy).toHaveBeenNthCalledWith(10, "crong : -");
    expect(consoleLogSpy).toHaveBeenNthCalledWith(11, "honux : --");

    consoleLogSpy.mockRestore();
  });

  test("executeMutipleRounds 실행시 executeOneRound가 정확한 횟수만큼 실행된다.", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const executeOneRoundSpy = jest.spyOn(racingCarGame, "executeOneRound");

    racingCarGame.executeMultipleRounds();

    expect(executeOneRoundSpy).toHaveBeenCalledTimes(
      racingCarGame.racingRounds
    );

    consoleLogSpy.mockRestore();
  });
});

describe("우승자 판별 및 우승자 출력", () => {
  test("distance 값에 맞는 우승자를 반환한다.(우승자 1명)", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.racingRounds = 3;

    racingCarGame.executeMultipleRounds();

    expect(racingCarGame.getWinners()).toEqual(["honux"]);

    consoleLogSpy.mockRestore();
  });

  test("distance 값에 맞는 우승자를 반환한다.(우승자 여러명)", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.racingRounds = 3;

    racingCarGame.executeMultipleRounds();

    expect(racingCarGame.getWinners()).toEqual(["crong", "honux"]);

    consoleLogSpy.mockRestore();
  });

  test("distance가 모두 0인 경우 우승자를 반환하지 않는다", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.racingRounds = 1;

    racingCarGame.executeMultipleRounds();

    expect(racingCarGame.getWinners()).toEqual([]);

    consoleLogSpy.mockRestore();
  });

  test("distance 값에 맞는 우승자가 출력된다.", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.racingRounds = 3;

    racingCarGame.executeMultipleRounds();

    racingCarGame.displayWinners();

    expect(consoleLogSpy).lastCalledWith(
      `crong,honux${WINNER_ANNOUNCEMENT_MESSAGE}`
    );

    consoleLogSpy.mockRestore();
  });

  test("우승자가 없는 경우 우승자가 없다는 문구가 출력된다.", () => {
    const { racingCarGame, consoleLogSpy } = initiallizeTestEnvironment();

    const checkForAdvanceSpy = jest.spyOn(racingCarGame, "checkForAdvance");

    checkForAdvanceSpy
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(false);

    racingCarGame.settingCars(["pobi", "crong", "honux"]);

    racingCarGame.racingRounds = 1;

    racingCarGame.executeMultipleRounds();

    racingCarGame.displayWinners();

    expect(consoleLogSpy).lastCalledWith(NO_WINNER_MESSAGE);

    consoleLogSpy.mockRestore();
  });
});
