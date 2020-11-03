const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  // event.userInfo 是已废弃的保留字段，在此不做展示
  // 获取 OPENID 等微信上下文请使用 cloud.getWXContext()

  let { OPENID, APPID, UNIONID } = cloud.getWXContext()
  const { courseId, userId } = event
  console.log(courseId, userId, event, 'event')
  const user = await db
    .collection('user')
    .where({
      openid: _.eq(OPENID),
    })
    .get()

  console.log(user, 'user')
  user.data[0].course.push(courseId)

  await db
    .collection('user')
    .doc(userId)
    .update({ data: { course: user.data[0].course } })

  const newUser = await db
    .collection('user')
    .where({
      openid: _.eq(OPENID),
    })
    .get()

  console.log(user, newUser, 'user')

  return {
    user: newUser.data[0],
  }
}
