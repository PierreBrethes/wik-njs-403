const { courseList } = require('../../data/db')

mockData = [
  { id: 1, name: 'Davy Jones', items:[]},
  { id: 2, name: 'Jeremy Truffier', items:[{id:1,item:'guacamole',bought:false}]}
]

module.exports = {
  up: () => {
    courseList.splice(0)
    courseList.push.apply(courseList, mockData)
  },

  down: () => {
    courseList.splice(0)
  }
}
