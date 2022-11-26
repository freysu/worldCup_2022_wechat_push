/*
 * @Author: freysu
 * @Date: 2022-11-24 02:32:10
 * @LastEditors: freysu
 * @LastEditTime: 2022-11-27 02:00:06
 * @Description: Frey takes you to watch the 2022 World Cup
 */

const fetch = require('node-fetch')
const pushplusToken = '' /* The token of pushplus for WeChat push service */

/**
 * Function entry :
 *  1. sendTodayMatch() :
 *     Get today's fixture
 *  2. sendFutureThreeDaysMatch() :
 *     Get the next three days fixture, in fact, change the 3 of variable b to 5, which is the next 5 days
 *  3. sendPoint() :
 *     Get the team standings
 */

/**
 * @description Get today's fixture
 */
function sendTodayMatch() {
  var a = formatDate(new Date().getTime() / 1000, true).slice(0, 10)
  console.log(a)
  sendMatchByDateMain(a)
}

/**
 * @description Get the next three days fixture, in fact, change the 3 of variable b to 5, which is the next 5 days
 */
function sendFutureThreeDaysMatch() {
  var curTimestamp = new Date().getTime()
  // 1000 * 60 * 60 * 24 * 1
  var a = formatDate(curTimestamp / 1000, true).slice(0, 10)
  var b = formatDate(
    (curTimestamp + 1000 * 60 * 60 * 24 * 3) / 1000,
    true
  ).slice(0, 10)
  console.log(a, b)
  sendMatchByDateMain(a, b, '未来三天')
}

/**
 * @description Get the team standings
 */
function sendStandings() {
  sendStandingsMain()
}

/**
 * @param {String} startDate Start date
 * @param {String} endDate End date
 * @param {String} desc
 * @returns
 */
async function sendMatchByDateMain(
  startDate,
  endDate = startDate,
  desc = '今日'
) {
  try {
    console.info(
      `sendMatchByDateMain start! Try to get : ${startDate} - ${endDate}`
    )
    var { scheduleArr: fixturesListArr } = await getMatchesByDateFromBili(
      startDate,
      endDate
    )
    fixturesListArr = Array.isArray(fixturesListArr)
      ? fixturesListArr.filter((item) => {
          if (item.hasOwnProperty('sid')) {
            return item.sid === 414
          }
        })
      : []
    // console.log('fixturesListArr: ', JSON.stringify(fixturesListArr[0]))
    var _fixturesListArr = fixturesListArr.map((item) => {
      const {
        away_score,
        away_team,
        start_time,
        end_time,
        game_stage,
        home_team,
        home_score,
        id,
        watch_point,
        contest_status
      } = item
      let { logo: hLogo } = home_team
      let { logo: aLogo } = away_team
      hLogo = String(hLogo).replace('/bfs/legacy/', '')
      aLogo = String(aLogo).replace('/bfs/legacy/', '')
      return {
        awayTeamScore: away_score,
        awayTeam: away_team,
        scheduleDateStartTime: start_time,
        scheduleDateEndTime: end_time,
        scheduleDateDesc: game_stage,
        homeTeam: home_team,
        homeTeamScore: home_score,
        id,
        watchPointTip: watch_point,
        scheduleStatus: contest_status, // 3:finished // 2：ongoing // 1：having not started
        hLogo,
        aLogo
      }
    })
    // console.log('fixturesListArr: ', _fixturesListArr)
    // console.log('_fixturesListArr.length: ', _fixturesListArr.length)
    _fixturesListArr = _fixturesListArr.sort(function (a, b) {
      return a.scheduleDateStartTime - b.scheduleDateStartTime
    })
    var _arr = formatArrFromDate(_fixturesListArr, 'scheduleDateStartTime')
    // console.log('_arr: ', JSON.stringify(_arr))
    var content = createDom(_arr, _fixturesListArr.length, desc)
    // console.log('content: ', content)
    sendNotify(`${desc} Fixtures`, content)
    console.log('sendTodayMatchMain end!')
  } catch (e) {
    console.error('e: ', e)
    return e
  }
}

async function sendStandingsMain() {
  try {
    console.info(`sendStandingsMain start! Try to get!`)

    var { group_teams: group_teamsArr } = await getPointFromBili()
    console.log('group_teamsArr: ', group_teamsArr)
    var _group_teamsArr = []
    group_teamsArr.forEach((item) => {
      _group_teamsArr.push(...item.teams)
    })

    var mdContent = createMarkdownTemplate(_group_teamsArr)
    sendNotify(`Standings - Group stage`, mdContent, 'markdown')

    console.log('sendStandingsMain end!')
  } catch (e) {
    console.error('e: ', e)
    return e
  }
}

/**
 * @description Generate a markdown template for the team standings to be pushed
 * @param {Array} arr origin array
 * @returns String
 */
function createMarkdownTemplate(arr) {
  var mdArr_A = []
  var mdArr_B = []
  var mdArr_C = []
  var mdArr_D = []
  var mdArr_E = []
  var mdArr_F = []
  var mdArr_G = []
  var mdArr_H = []
  arr.map((item) => {
    const {
      group_name,
      team_name,
      icon_url,
      win_times,
      lose_times,
      score,
      rank,
      tie_times,
      win_small_score,
      lose_small_score
    } = item
    var _icon_url = icon_url.replace(
      '/bfs/legacy/', // don't change it!
      'Your warehouse folder/img/teamlogo/'
    )
    const md = `| ${rank} | <img src="${_icon_url}">${team_name} | ${win_times} | ${tie_times} | ${lose_times} | ${win_small_score}/${lose_small_score} | ${score}  |`
    switch (group_name) {
      case 'A':
        mdArr_A.push(md)
        break
      case 'B':
        mdArr_B.push(md)
        break
      case 'C':
        mdArr_C.push(md)
        break
      case 'D':
        mdArr_D.push(md)
        break
      case 'E':
        mdArr_E.push(md)
        break
      case 'F':
        mdArr_F.push(md)
        break
      case 'G':
        mdArr_G.push(md)
        break
      case 'H':
        mdArr_H.push(md)
        break
      default:
        break
    }
  })

  mdArr_A = mdArr_A.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  mdArr_B = mdArr_B.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  mdArr_C = mdArr_C.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  mdArr_D = mdArr_D.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  mdArr_E = mdArr_E.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  mdArr_F = mdArr_F.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  mdArr_G = mdArr_G.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  mdArr_H = mdArr_H.sort(function (a, b) {
    return Number(a.slice(2, 3)) - Number(b.slice(2, 3))
  })
  var mdContent = `<style type="text/css">img{border:0;vertical-align:middle;width:1rem;height:auto}th{padding:0 !important}td{padding:0.5rem !important}</style>\n| A | 球队 | 胜 | 平 | 负 | 进/失 | 积分 |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_A.join(
    '\n'
  )}\n\n| B | Teams | Win |  Draw | Lose | Goal/Concede | Points |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_B.join(
    '\n'
  )}\n\n| C | Teams | Win |  Draw | Lose | Goal/Concede | Points |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_C.join(
    '\n'
  )}\n\n| D | Teams | Win |  Draw | Lose | Goal/Concede | Points |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_D.join(
    '\n'
  )}\n\n| E | Teams | Win |  Draw | Lose | Goal/Concede | Points |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_E.join(
    '\n'
  )}\n\n| F| Teams | Win |  Draw | Lose | Goal/Concede | Points |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_F.join(
    '\n'
  )}\n\n| G | Teams | Win |  Draw | Lose | Goal/Concede | Points |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_G.join(
    '\n'
  )}\n\n| H | Teams | Win |  Draw | Lose | Goal/Concede | Points |\n|:---:|:---:|:---:|:---:|:---:|:---:|:---:|\n${mdArr_H.join(
    '\n'
  )}\n<div class="watch-point-tip"style="width: 100%;text-align: center;margin: 5px;">Footer</div></body>`
  console.log(mdContent)
  return mdContent
}

/**
 * @description Generate a HTML template for the fixtures by designated date to be pushed
 * @param {Array} _arr origin array
 * @param {Number} len _arr.length
 * @param {String} desc
 * @returns String
 */
function createDom(_arr, len, desc) {
  var sectionArr = []
  _arr.forEach((item) => {
    const scheduleDate = item.date
    var liArr = []
    item.dataList.forEach((_item) => {
      const {
        awayTeamScore,
        awayTeam,
        scheduleDateStartTime,
        scheduleDateEndTime,
        scheduleDateDesc,
        homeTeam,
        homeTeamScore,
        watchPointTip,
        scheduleStatus,
        hLogo: homeTeamIcon,
        aLogo: awayTeamIcon
      } = _item
      const { title: homeTeamName } = homeTeam
      const { title: awayTeamName } = awayTeam
      var matchStartTime = formatDate(scheduleDateStartTime)
      var matchEndTime = formatDate(scheduleDateEndTime)
      var curHomeTeamScore = homeTeamScore
      var curAwayTeamScore = awayTeamScore
      var isAfter =
        endTime(scheduleDateStartTime * 1000) -
          Number(scheduleDateEndTime * 1000) >
        0
          ? ''
          : 'the day after'
      var matchStatus =
        scheduleStatus === 1
          ? 'notStarted'
          : scheduleStatus === 2
          ? 'ongoing'
          : scheduleStatus === 3
          ? 'finished'
          : ''
      if (matchStatus !== 'notStarted') {
        var curScore = Number(curHomeTeamScore) - Number(curAwayTeamScore)
        var result1 = ''
        var result2 = ''
        if (!isNaN(curScore)) {
          // 有效数字
          if (curScore > 0) {
            result1 = 'team-item-win'
            result2 = 'team-item-lose'
          } else if (curScore < 0) {
            result1 = 'team-item-lose'
            result2 = 'team-item-win'
          }
        }
      } else {
        matchEndTime = ''
        isAfter = ''
        curHomeTeamScore = '-'
        curAwayTeamScore = '-'
      }
      liArr.push(
        `<li class="schedule-item"><div class="schedule-item-main"><div class="date"><div class="date-time">${matchStartTime}</div><div class="date-desc">${scheduleDateDesc}</div></div><ul class="team"><li class="team-item ${result1}"><div class="team-item-info"><img class="team-item-logo"src="Your warehouse folder/img/teamlogo/${homeTeamIcon}"alt=""><span class="team-item-name">${homeTeamName}</span></div><span class="team-item-score">${curHomeTeamScore}</span></li><li class="team-item ${result2}"><div class="team-item-info"><img class="team-item-logo"src="Your warehouse folder/img/teamlogo/${awayTeamIcon}"alt="${awayTeamName}"><span class="team-item-name">${awayTeamName}</span></div><span class="team-item-score">${curAwayTeamScore}</span></li></ul><div class="status"><div class="text">${matchStatus}</div><div class="pv">${isAfter}${matchEndTime}</div></div></div><div class="watch-point-div">${
          watchPointTip !== ''
            ? `<img src="Your warehouse folder/img/watch-point.png"class="watch-point-icon"><div class="watch-point-tip">${watchPointTip}</div>`
            : '</br>'
        }</div></li>`
      )
    })

    sectionArr.push(
      `<section class="daily-schedule"><div class="daily-schedule-date">${scheduleDate}</div><ul class="daily-schedule-list">${liArr.join(
        ''
      )}</ul></section>`
    )
  })

  var res = `<body hupu-ui-theme="light"><link rel="stylesheet"href="Your warehouse folder/css/globals.css"><link rel="stylesheet"href="Your warehouse folder/css/reset.css"><link rel="stylesheet"href="Your warehouse folder/css/theme.css"><link rel="stylesheet"href="Your warehouse folder/css/style1.css"><a class="match-footer"><span>${desc}All games</span><span><span>${len}</span></span></a><div class="style_schedule__r0wYZ">${sectionArr.join(
    ''
  )}</div><div class="watch-point-tip"style="width: 100%;text-align: center;margin: 5px;">Footer</div></body>`
  console.log(res.length)
  return res
}

/**
 * @description Return on the day of the last seconds of time stamp
 * @param {Number} timeStamp Millisecond time stamp
 * @returns Millisecond time stamp
 */
function endTime(timeStamp) {
  const nowTimeDate = new Date(timeStamp)
  return nowTimeDate.setHours(23, 59, 59, 999)
}

/**
 * @description This request is used to get all the match by designated date
 * @param  {String} sTime YY-MM-DD
 * @param  {String} eTime YY-MM-DD
 * @returns Object{ sTime, eTime, scheduleArr: res.data.list }
 */
function getMatchesByDateFromBili(sTime, eTime) {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.bilibili.com/x/esports/matchs/list?etime=${eTime}&forbid=1&pn=1&ps=50&sports_centre=1&stime=${sTime}&sid=414`,
      {
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      }
    )
      .then((res) => res.json())
      .then((res) => {
        resolve({ sTime, eTime, scheduleArr: res.data.list })
        return { sTime, eTime, scheduleArr: res.data.list }
      })
      .catch((err) => {
        console.error(err)
        reject(err)
      })
  })
}

/**
 * @description This request is used to get the team standings
 * @param  {String} sTime YY-MM-DD
 * @param  {String} eTime YY-MM-DD
 * @returns Object{group_teams: res.data.group_teams }
 */
function getPointFromBili() {
  return new Promise((resolve, reject) => {
    fetch(
      `https://api.bilibili.com/x/esports/season/series/point_match?series_id=579`,
      {
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'GET',
        mode: 'cors',
        credentials: 'include'
      }
    )
      .then((res) => res.json())
      .then((res) => {
        resolve({ group_teams: res.data.group_teams })
        return { group_teams: res.data.group_teams }
      })
      .catch((err) => {
        console.error(err)
        reject(err)
      })
  })
}

/**
 * @description This request is used to send message to user with wechat push service
 * @param {String} title The title of the message
 * @param {String} content The content of the message
 * @param {String} template  The template type of the message
 * @returns null
 */
function sendNotify(title, content, template = 'html') {
  return new Promise((resolve, reject) => {
    var data = {
      topic: '', // Group number
      token: pushplusToken,
      title,
      content,
      template,
      channel: 'wechat' // The type of channel,default:wechat
    }
    fetch('http://www.pushplus.plus/api/send', {
      headers: {
        'content-type': 'application/json;charset=UTF-8'
      },
      body: JSON.stringify(data),
      method: 'POST'
    })
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.log('error', error))
  })
}

/**
 * @description Convert a second-level timestamp to a date format
 * @param {Number} timeStamp second-level timestamp
 * @param {Boolean} isNeedMore default: false
 * @returns true: `YY-MM-DD HH:MM:SS` false: `HH:MM`
 */
function formatDate(timeStamp, isNeedMore = false) {
  var date = new Date(timeStamp * 1000)
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()
  var hour = date.getHours()
  var min = date.getMinutes()
  var sec = date.getSeconds()
  const leadingDigit = (num, len = 2, sep = '0') =>
    `${Array(len + 1).join(sep)}${num}`.slice(-len)
  return isNeedMore
    ? `${year}-${leadingDigit(month)}-${leadingDigit(day)} ${leadingDigit(
        hour
      )}:${leadingDigit(min)}:${leadingDigit(sec)}`
    : `${leadingDigit(hour)}:${leadingDigit(min)}`
}

/**
 * @description Sort the array by timestamp
 * @param {Array} sortedDateList An array of objects sorted by timestamp
 * @param {String} keyName key
 * @returns
 */
function formatArrFromDate(sortedDateList, keyName) {
  var arr = []
  sortedDateList.forEach(function (item, i) {
    var tmpDate = new Date(item[keyName] * 1000)
    var day = tmpDate.getDate()
    var month = tmpDate.getMonth() + 1
    var year = tmpDate.getFullYear()
    if (i === 0) {
      var tmpObj = {}
      tmpObj.date = year + '-' + month + '-' + day
      tmpObj.dataList = []
      tmpObj.dataList.push(item)
      arr.push(tmpObj)
    } else {
      if (arr[arr.length - 1]['date'] === year + '-' + month + '-' + day) {
        arr[arr.length - 1]['dataList'].push(item)
      } else {
        var _tmpObj = {}
        _tmpObj.date = year + '-' + month + '-' + day
        _tmpObj.dataList = []
        _tmpObj.dataList.push(item)
        arr.push(_tmpObj)
      }
    }
  })
  return arr
}
