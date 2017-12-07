const request = require('supertest')
const chai = require('chai')
const expect = chai.expect
chai.should()


const { find } = require('lodash')

const db = require('../../data/db')
const app = require('../../app')

const courseListFixture = require('../fixtures/courseList')

describe('CourselistController', () => {
  beforeEach(() => { courseListFixture.up() })
  afterEach(() => { courseListFixture.down() })

  describe('When I create a courseList (POST /course-lists)', () => {
    it('should reject with a 400 when no name is given', () => {
      return request(app).post('/course-lists').then((res) => {
        res.status.should.equal(400)
        res.body.should.eql({
          error: {
            code: 'VALIDATION',
            message: 'Missing name'
          }
        })
      })
    })
    it('should reject 400 when name is not unique', () => {
      return request(app)
        .post('/course-lists')
        .send({ name: 'Davy Jones' })
        .then((res) => {
          res.status.should.equal(400)
          res.body.should.eql({
            error: {
              code: 'VALIDATION',
              message: 'Name should be unique'
            }
          })
      })
    })
    it('should succesfuly create a courseList', () => {
      const mockName = 'My New List'

      return request(app)
        .post('/course-lists')
        .send({ name: mockName })
        .then((res) => {
          res.status.should.equal(200)
          expect(res.body.data).to.be.an('object')
          res.body.data.name.should.equal(mockName)

          const result = find(db.courseList, { name: mockName } )
          result.should.not.be.empty
          result.should.eql({
            id: res.body.data.id,
            name: res.body.data.name
          })
        })
    })
  })

  describe('When I delete a courseList (DELETE /course-lists/:id)',() => {
    it('should reject with a 404 when no id is given', () => {
      return request(app)
      .delete('/course-lists')
      .then((res)=>{
        res.status.should.equal(404)
        res.body.should.eql({
          error: {
            code: 'NOT_FOUND',
            message: 'Page not found'
          }
        })
      })
    })
    it('should reject with a 404 when id does not exist is given', () => {
      return request(app)
      .delete('/course-lists/339583')
      .then((res) => {
        res.status.should.equal(404)
        res.body.should.eql({
          error:{
            code:'NOT_FOUND',
            message:'ID not found'
          }
        })
      })
    })
    it('should succesfuly delete', () => {
      return request(app)
      .delete('/course-lists/1')
      .then((res)=>{
        res.status.should.equal(200)
        expect(res.body.data).to.be.an('array')
        res.body.data.length.should.equal(1)
        res.body.data[0].should.eql({
          id:2,
          name:'Jeremy Truffier',
          items:[{id:1,item:'guacamole',bought:false}]
        })
      })
    })
  })

  describe('When I get courseLists (GET /)',() => {
    it('should successfuly get', () => {
      return request(app)
      .get('/course-lists')
      .then((res) => {
        res.status.should.equal(200)
        res.body.data[0].should.eql({ id: 1, name: 'Davy Jones', items:[] })
        res.body.data[1].should.eql({ id: 2, name: 'Jeremy Truffier', items:[{id:1,item:'guacamole',bought:false}] })
      })
    })
  })

  describe('When I add item into courseLists (PUT /)', () => {
    it('should reject with a 400 when no listID passed', ()=>{
      return request(app)
      .put('/course-lists')
      .send({itemName:'test'})
      .then((res) => {
        res.status.should.equal(400)
        res.body.should.eql({
          error:{
            code:'VALIDATION',
            message:'Missing listID'
          }
        })
      })
    })
    it('should reject with a 400 when no itemName passed',() => {
      return request(app)
      .put('/course-lists')
      .send({listID:1})
      .then((res) => {
        res.status.should.equal(400)
        res.body.should.eql({
          error:{
            code:'VALIDATION',
            message:'Missing itemName'
          }
        })
      })
    })
    it('should reject with a 404 when name does not exist',() => {
      return request(app)
      .put('/course-lists')
      .send({
        listID:30,
        itemName:'RIPJhonny'
      })
      .then((res)=>{
        res.status.should.equal(404)
        res.body.should.eql({
          error:{
            code:'NOT_FOUND',
            message:'ID not found'
          }
        })
      })
    })
    it('should succesfuly add an item',() => {
      return request(app)
      .put('/course-lists')
      .send({
        listID:1,
        itemName:'kawabounga'
      })
      .then((res)=>{
        res.status.should.equal(200)
        expect(res.body.data).to.be.an('object')
        const id = res.body.data.items[0].id
        res.body.data.should.eql({
          id:1,
          name:'Davy Jones',
          items:[
            {
              item:'kawabounga',
              bought:false,
              id: id
            }
          ]
        })
      })
    })
  })

  describe('When I get items from a course list (GET /:list)',()=>{
    it('should reject 400 when list does not exist',()=>{
      return request(app)
      .get('/course-lists/weshalors')
      .then((res)=>{
        res.status.should.equal(404)
        res.body.should.eql({
          error:'NOT_FOUND'
        })
      })
    })
    it('should succesfuly list items from course list',()=>{
      return request(app)
      .get('/course-lists/Jeremy Truffier')
      .then((res)=>{
        res.status.should.equal(200)
        res.body.data.should.eql([{id:1,item:'guacamole',bought:false}])
        expect(res.body.data).to.be.an('array')
      })
    })
  })

  describe('When I buy item from course list (PUT /buy)',()=>{
    it('should reject 400 when no listID passed',()=>{
      return request(app)
      .put('/course-lists/buy')
      .send({itemID:1})
      .then((res)=>{
        res.status.should.equal(400)
        res.body.should.eql({
          error:{
            code:'VALIDATION',
            message:'no listID passed'
          }
        })
      })
    })
    it('should reject 400 when no itemID passed',()=>{
      return request(app)
      .put('/course-lists/buy')
      .send({listID:2})
      .then((res)=>{
        res.status.should.equal(400)
        res.body.should.eql({
          error:{
            code:'VALIDATION',
            message:'no itemID passed'
          }
        })
      })
    })
    it('should succesfuly buy an item',() => {
      return request(app)
      .put('/course-lists/buy')
      .send({
        itemID:1,
        listID:2
      })
      .then((res)=>{
        res.status.should.equal(200)
        expect(res.body.data).to.be.an('object')
        res.body.data.should.eql({
          id:1,
          item:'guacamole',
          bought:true
        })
      })
    })
    it('should reject 404 when list or item does not exist',() => {
      return request(app)
      .put('/course-lists/buy')
      .send({
        itemID:954384543,
        listID:1
      })
      .then((res)=>{
        res.status.should.equal(404)
        res.body.should.eql({
          error:{
            code:'NOT_FOUND',
            message:'listID or itemID not found'
          }
        })
      })
    })
  })

})
