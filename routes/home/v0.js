const express = require('express');
const moment = require('moment');
const sequelize = require('sequelize');
const asyncRoute = require('../../utils/asyncRoute');
const bannerData = require('../../utils/homeBannerText.json');
const { getWeekOfMonth } = require('../../utils/weekCalculation');
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
  const { isSkipped } = req.params;

  if (isSkipped === undefined) {
    throw new HttpBadRequest(Errors.HOME.IS_SKIPPED_MISSING);
  }

  const resJourneyComplete = {
    case: 'journey_complete',
    starList: [],
    mainText: '',
    bannerTitle: null,
    bannerText: null,
    buttonText: null,
  };

  const resJourneyIncomplete = {
    case: 'journey_incomplete',
    starList: {},
    mainText: '',
    bannerTitle: bannerData.journey_incomplete.bannerTitle,
    bannerText: bannerData.journey_incomplete.bannerText,
    buttonText: bannerData.journey_incomplete.buttonText,
  };

  const resRetrospect = {
    case: 'retrospect',
    starList: {},
    mainText: '',
    bannerTitle: '',
    bannerText: '',
    buttonText: bannerData.retrospect.buttonText,
  };

  const weekInfo = await getWeekOfMonth(new Date());

  // 이번주 여정 존재 여부 확인
  let thisWeekJourney;
  try {
    thisWeekJourney = await Journey.findAll({
      include: {
        model: ToDo,
        required: false,
        attributes: ['idx', 'title', 'date', 'isTop', 'isDone'],
      },
      where: {
        year: weekInfo.year,
        month: weekInfo.month,
        weekNo: weekInfo.weekNo,
        userIdx: user.idx,
      },
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  // 가장 최신 여정 조회
  let lastJourney;
  try {
    lastJourney = await Journey.findOne({
      where: {
        [sequelize.Op.not]: [
          {
            year: weekInfo.year,
            month: weekInfo.month,
            weekNo: weekInfo.weekNo,
          },
        ],
        userIdx: user.idx,
      },
      order: [
        ['year', 'DESC'],
        ['month', 'DESC'],
        ['weekNo', 'DESC'],
      ],
    });
  } catch (e) {
    throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
  }

  // 가장 최신 여정 회고 여부 확인
  let lastRetrospect;
  if (lastJourney) {
    const lastJourneyYear = lastJourney.dataValues.year;
    const lastJourneyMonth = lastJourney.dataValues.month;
    const lastJourneyWeekNo = lastJourney.dataValues.weekNo;

    try {
      lastRetrospect = await Retrospect.findOne({
        where: {
          [sequelize.Op.not]: [
            {
              year: weekInfo.year,
              month: weekInfo.month,
              weekNo: weekInfo.weekNo,
            },
          ],
          year: lastJourneyYear,
          month: lastJourneyMonth,
          weekNo: lastJourneyWeekNo,
          userIdx: user.idx,
        },
      });
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }
  }

  // 1. 회고 완료  or 건너뛰기 한 경우 or {회고 미완료&지난 여정이 없는 경우}
  if (
    lastRetrospect || isSkipped === 'true' || (!lastRetrospect && !lastJourney)
  ) {
    // 1-1. 이번주 여정 작성 완료
    if (thisWeekJourney.length !== 0) {
      const thisWeekValues = {};
      const thisWeekFoundValues = {};
      let yesterdayValueCnt = 0;
      const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
      thisWeekJourney.forEach((journeys) => {
        journeys.dataValues.toDos.forEach((toDo) => {
          const toDoValue1 = journeys.dataValues.value1;
          const toDoValue2 = journeys.dataValues.value2;

          thisWeekValues[toDoValue1] = 0;
          if (thisWeekValues[toDoValue2]) thisWeekValues[toDoValue2] = 0;
          if (toDo.dataValues.isDone) {
            if (thisWeekFoundValues[toDoValue1]) {
              thisWeekFoundValues[toDoValue1] += 1;
            } else {
              thisWeekFoundValues[toDoValue1] = 1;
            }

            if (toDoValue2) {
              if (thisWeekFoundValues[toDoValue2]) {
                thisWeekFoundValues[toDoValue2] += 1;
              } else {
                thisWeekFoundValues[toDoValue2] = 1;
              }
            }

            if (
              moment(toDo.dataValues.isDone).format('YYYY-MM-DD') === yesterday
            ) {
              yesterdayValueCnt += 1;
              if (toDoValue2) yesterdayValueCnt += 1;
            }
          }
        });
      });

      Object.keys(thisWeekFoundValues).forEach((value) => {
        if (thisWeekFoundValues[value] >= 7) {
          thisWeekFoundValues[value] = 4;
        } else if (thisWeekFoundValues[value] >= 5) {
          thisWeekFoundValues[value] = 3;
        } else if (thisWeekFoundValues[value] >= 3) {
          thisWeekFoundValues[value] = 2;
        } else if (thisWeekFoundValues[value] >= 1) {
          thisWeekFoundValues[value] = 1;
        } else {
          thisWeekFoundValues[value] = 0;
        }
      });

      // 1-1-1. 어제 찾은 별이 있는 경우
      resJourneyComplete.starList = thisWeekFoundValues;
      if (yesterdayValueCnt > 0) {
        resJourneyComplete.mainText = `어제는\n${yesterdayValueCnt}개의 별을 발견했어요.`;
        return res.status(200).json(resJourneyComplete);
      }

      // 1-1-2. 어제 찾은 별이 없는 경우
      resJourneyComplete.mainText = '오늘 별을 찾으러 떠나볼까요?';
      if (Object.keys(thisWeekFoundValues).length === 0) {
        resJourneyComplete.starList = thisWeekValues;
      }
      return res.status(200).json(resJourneyComplete);
    }
    // 1-2. 이번주 여정 작성 미완료
    const randomInteger = getRandomInteger(
      0,
      bannerData.journey_incomplete.mainText.length - 1,
    );
    resJourneyIncomplete.mainText = bannerData.journey_incomplete[randomInteger];
    return res.status(200).json(resJourneyIncomplete);
  }
  // 2. 회고 미완료 &. 지난 여정이 있는 경우
  if (!lastRetrospect && lastJourney) {
    let lastWeekJourneys;
    try {
      lastWeekJourneys = await Journey.findAll({
        include: {
          model: ToDo,
          required: false,
          attributes: ['idx', 'title', 'date', 'isTop', 'isDone'],
        },
        where: {
          year: lastJourney.dataValues.year,
          month: lastJourney.dataValues.month,
          weekNo: lastJourney.dataValues.weekNo,
          userIdx: user.idx,
        },
      });
    } catch (e) {
      throw new HttpInternalServerError(Errors.SERVER.UNEXPECTED_ERROR, e);
    }

    let allToDosCnt = 0;
    let doneToDosCnt = 0;

    lastWeekJourneys.forEach((journeys) => {
      journeys.dataValues.toDos.forEach((toDo) => {
        allToDosCnt += 1;
        if (toDo.dataValues.isDone) {
          doneToDosCnt += 1;
        }
      });
    });

    resRetrospect.mainText = '때로는\n휴식도 도움이 된답니다.';
    resRetrospect.bannerTitle = bannerData.retrospect.under60.bannerTitle;
    resRetrospect.bannerText = bannerData.retrospect.under60.bannerText;
    // 2-1. 최근 여정 완료한 일 / 전체 한 일 >= 60
    if (doneToDosCnt / allToDosCnt >= 0.6) {
      const randomInteger = getRandomInteger(
        0,
        bannerData.retrospect.over60.mainText.length - 1,
      );
      resRetrospect.mainText = `${lastJourney.dataValues.month}월 ${lastJourney.dataValues.weekNo}째주\n${bannerData.retrospect.over60.mainText[randomInteger]}`;
      resRetrospect.bannerTitle = bannerData.retrospect.over60.bannerTitle;
      resRetrospect.bannerText = bannerData.retrospect.over60.bannerText;
    }
    return res.status(200).json(resRetrospect);
  }
  return res.status(200);
};

const router = express.Router();

// 홈 화면 배너 조회
router.get('/banner/:isSkipped', auth.authenticate({}), asyncRoute(getHomeBanner));

module.exports = {
  router,
  getHomeBanner,
};
