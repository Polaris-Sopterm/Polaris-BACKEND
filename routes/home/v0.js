const express = require('express');
const moment = require('moment');
const asyncRoute = require('../../utils/asyncRoute');
const bannerData = require('../../utils/homeBannerText.json');
const { getWeekOfMonthByIso8601 } = require('../../utils/weekCalculation');
const { getRandomInteger } = require('../../utils/random');
const db = require('../../models');
const auth = require('../../middlewares/auth');
const {
  Errors,
  HttpBadRequest,
  HttpInternalServerError,
} = require('../../middlewares/error');

const { Journey, ToDo, Retrospect } = db;

/**
 * 홈 화면 배너 조회
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<*>}
 */
const getHomeBanner = async (req, res) => {
  const { user } = res.locals.auth;
  const { year, month, weekNo } = req.query;
  const reqWeekInfo = { year, month, weekNo };

  if (!(year && month && weekNo)) {
    throw new HttpBadRequest(Errors.HOME.WEEK_INFO_MISSING);
  }

  const resJourneyComplete = {
    case: 'journey_complete',
    starList: [],
    mainText: '',
    boldText: '',
    bannerTitle: null,
    bannerText: null,
    buttonText: null,
    lastWeek: {},
  };

  const resJourneyIncomplete = {
    case: 'journey_incomplete',
    starList: [],
    mainText: '',
    boldText: '',
    bannerTitle: bannerData.journey_incomplete.bannerTitle,
    bannerText: bannerData.journey_incomplete.bannerText,
    buttonText: bannerData.journey_incomplete.buttonText,
    lastWeek: {},
  };

  const resRetrospect = {
    case: 'retrospect',
    starList: [],
    mainText: '',
    boldText: '',
    bannerTitle: '',
    bannerText: '',
    buttonText: bannerData.retrospect.buttonText,
    lastWeek: {},
  };

  const today = new Date();
  const thisWeekInfo = await getWeekOfMonthByIso8601(today);
  let thisWeekFlag = false;
  let lastWeekInfo;
  let lastWeekJourneys = [];
  let lastWeekRetrospect = [];
  let isRetrospectDone = false;
  let isSkipped = false;

  // 요청 주가 이번주인 경우
  if (
    Object.entries(reqWeekInfo).toString() === Object.entries(thisWeekInfo).toString()
  ) {
    thisWeekFlag = true;
    lastWeekInfo = await getWeekOfMonthByIso8601(
      new Date(today.setDate(today.getDate() - 7)),
    );

    let lastDefaultJourney;
    try {
      lastDefaultJourney = await Journey.findOne({
        attributes: ['isRetrospectSkipped'],
        where: {
          title: 'default',
          year: lastWeekInfo.year,
          month: lastWeekInfo.month,
          weekNo: lastWeekInfo.weekNo,
          userIdx: user.idx,
        },
      });
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }
    if (lastDefaultJourney) {
      isSkipped = lastDefaultJourney.dataValues.isRetrospectSkipped;
    }

    const lastWhere = {
      year: lastWeekInfo.year,
      month: lastWeekInfo.month,
      weekNo: lastWeekInfo.weekNo,
      userIdx: user.idx,
    };

    try {
      lastWeekRetrospect = await Retrospect.findOne({
        where: lastWhere,
      });
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }

    try {
      lastWeekJourneys = await Journey.findAll({
        include: {
          model: ToDo,
          required: false,
          attributes: ['idx', 'isDone'],
        },
        where: lastWhere,
      });
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }

    if (
      lastWeekRetrospect || (isSkipped && !lastWeekRetrospect) || lastWeekJourneys.length === 0
    ) isRetrospectDone = true;

    // 1. 요청 주가 이번주 & 회고 미완료 & 회고 건너뛰기(x) => [resRetrospect]
    if (!isRetrospectDone) {
      let allToDosCnt = 0;
      let doneToDosCnt = 0;

      lastWeekJourneys.forEach((journeys) => {
        journeys.dataValues.toDos.forEach((toDo) => {
          allToDosCnt += 1;
          if (toDo.dataValues.isDone) doneToDosCnt += 1;
        });
      });

      // 최근 여정 완료한 일 / 전체 한 일 >= 0.6
      if (doneToDosCnt / allToDosCnt >= 0.6) {
        const randomInteger = getRandomInteger(
          0,
          bannerData.retrospect.over60.mainText.length - 1,
        );
        resRetrospect.mainText = `${lastWeekInfo.month}월 ${lastWeekInfo.weekNo}째주${bannerData.retrospect.over60.mainText[randomInteger]}`;
        resRetrospect.boldText = `${lastWeekInfo.month}월 ${lastWeekInfo.weekNo}째주`;
        resRetrospect.bannerTitle = bannerData.retrospect.over60.bannerTitle;
        resRetrospect.bannerText = bannerData.retrospect.over60.bannerText;
      } else {
        // 최근 여정 완료한 일 / 전체 한 일 < 0.6
        const randomInteger = getRandomInteger(
          0,
          bannerData.retrospect.under60.mainText.length - 1,
        );
        resRetrospect.mainText = bannerData.retrospect.under60.mainText[randomInteger];
        resRetrospect.boldText = bannerData.retrospect.under60.boldText[randomInteger];
        resRetrospect.bannerTitle = bannerData.retrospect.under60.bannerTitle;
        resRetrospect.bannerText = bannerData.retrospect.under60.bannerText;
      }
      resRetrospect.lastWeek = lastWeekInfo;
      return res.status(200).json(resRetrospect);
    }
  }

  let reqWeekJourneys;
  try {
    reqWeekJourneys = await Journey.findAll({
      include: {
        model: ToDo,
        required: false,
        attributes: ['idx', 'isDone'],
      },
      where: {
        year,
        month,
        weekNo,
        userIdx: user.idx,
      },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  // 2. 요청 주가 이번주 & 여정 작성 미완료 => [resJourneyIncomplete]
  if (thisWeekFlag && reqWeekJourneys.length <= 1) {
    const randomInteger = getRandomInteger(
      0,
      bannerData.journey_incomplete.mainText.length - 1,
    );
    resJourneyIncomplete.mainText = bannerData.journey_incomplete.mainText[randomInteger];
    resJourneyIncomplete.boldText = bannerData.journey_incomplete.boldText[randomInteger];
    return res.status(200).json(resJourneyIncomplete);
  }

  // 3. [resJourneyComplete]
  // 3-1. 여정 작성 완료
  if (reqWeekJourneys.length > 1) {
    const reqWeekFoundValues = {};
    reqWeekJourneys.forEach((journey) => {
      if (journey.dataValues.title !== 'default') {
        const toDoValue1 = journey.dataValues.value1;
        const toDoValue2 = journey.dataValues.value2;
        if (!reqWeekFoundValues[toDoValue1]) reqWeekFoundValues[toDoValue1] = 0;
        if ((toDoValue2) && (!reqWeekFoundValues[toDoValue2])) {
          reqWeekFoundValues[toDoValue2] = 0;
        }
        journey.dataValues.toDos.forEach((toDo) => {
          if (toDo.dataValues.isDone) {
            reqWeekFoundValues[toDoValue1] += 1;
            if (toDoValue2) reqWeekFoundValues[toDoValue2] += 1;
          }
        });
      }
    });

    const reqWeekValueList = [];
    Object.keys(reqWeekFoundValues).forEach((value) => {
      if (reqWeekFoundValues[value] >= 7) {
        reqWeekValueList.push({ name: value, level: 4 });
      } else if (reqWeekFoundValues[value] >= 5) {
        reqWeekValueList.push({ name: value, level: 3 });
      } else if (reqWeekFoundValues[value] >= 3) {
        reqWeekValueList.push({ name: value, level: 2 });
      } else if (reqWeekFoundValues[value] >= 1) {
        reqWeekValueList.push({ name: value, level: 1 });
      } else {
        reqWeekValueList.push({ name: value, level: 0 });
      }
    });

    resJourneyComplete.starList = reqWeekValueList;

    // 3-1-1. 요청 주가 이번주가 아닌 경우
    if (!thisWeekFlag) {
      resJourneyComplete.mainText = `${month}월 ${weekNo}째주에\n찾은 별들이에요!`;
      resJourneyComplete.boldText = `${month}월 ${weekNo}째주`;
    } else {
      // 3-1-2. 요청 주가 이번주인 경우
      let yesterdayValueCnt = 0;
      const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
      reqWeekJourneys.forEach((journey) => {
        if (journey.dataValues.title !== 'default') {
          journey.dataValues.toDos.forEach((toDo) => {
            const toDoValue2 = journey.dataValues.value2;
            if (
              moment(toDo.dataValues.isDone).format('YYYY-MM-DD') === yesterday
            ) {
              yesterdayValueCnt += 1;
              if (toDoValue2) yesterdayValueCnt += 1;
            }
          });
        }
      });
      // 3-1-2-1. 어제 찾은 별이 있는 경우
      if (yesterdayValueCnt > 0) {
        resJourneyComplete.mainText = `어제는\n${yesterdayValueCnt}개의 별을 발견했어요.`;
        resJourneyComplete.boldText = `${yesterdayValueCnt}개의 별`;
      } else {
        // 3-1-2-2. 어제 찾은 별이 없는 경우
        resJourneyComplete.mainText = '오늘 별을 찾으러\n떠나볼까요?';
        resJourneyComplete.boldText = '별을 찾으러';
      }
    }
  } else if (!thisWeekFlag) {
    resJourneyComplete.mainText = '이 주에는\n생성된 여정이 없어요.';
    resJourneyComplete.boldText = '이 주에는';
    resJourneyComplete.starList = [{ name: 'empty', level: 0 }];
  }
  return res.status(200).json(resJourneyComplete);
};

const router = express.Router();

// 홈 화면 배너 조회
router.get(
  '/banner',
  auth.authenticate({}),
  asyncRoute(getHomeBanner),
);

module.exports = {
  router,
  getHomeBanner,
};
