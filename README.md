# worldCup_2022_wechat_push

Frey takes you to watch the 2022 World Cup

## Tips

1. **This is a project in Node.Js! You have to `npm install`**
2. **Please install  `node-fetch@2.6.7"` this package**
3. **You must have the token of pushplus!**
4. **`worldCup_2022_wechat_push.js` is main JS file,other files are not important!**

## Function entry

1. `sendTodayMatch()` :
    Get today's fixture
2. `sendFutureThreeDaysMatch()` :
    Get the next three days fixture
3. `sendPoint()` :
    Get the team standings

## Api used in this project

1. This api can get all the match by designated date
 `https://api.bilibili.com/x/esports/matchs/list?etime=${eTime}&forbid=1&pn=1&ps=50&sports_centre=1&stime=${sTime}&sid=414`
2. This api can get the team standings.
 `https://api.bilibili.com/x/esports/season/series/point_match?series_id=579`

## End

Thanks!
