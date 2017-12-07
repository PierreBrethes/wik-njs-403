const express = require('express')
const router = express.Router()
const { find } = require('lodash')

const db = require('../data/db')
const courseListCollection = db.courseList

// créer une liste de course
router.post('/', (req, res, next) => {
  if (!req.body.name) {
    res.status(400)
    return res.json({
      error: {
        code: 'VALIDATION',
        message: 'Missing name'
      }
    })
  }

  const name = req.body.name

  // vérification de noms dupliqués
  const result = find(courseListCollection, { name })
  if (result) {
    res.status(400)
    return res.json({
      error: {
        code: 'VALIDATION',
        message: 'Name should be unique'
      }
    })
  }
  const newCourseList = {
    id: createUid(),
    name
  }

  courseListCollection.push(newCourseList)

  return res.json({
    data: newCourseList
  })
}),

// supprimer une liste (par son id)
router.delete('/:id', (req,res,next) => {
  let notFound = true;
  const id = req.params.id;
  courseListCollection.forEach((item, index, object)=>{
    if(item.id == id){
      notFound = false
      courseListCollection.splice(index,1)
      res.status(200)
      return res.json({data : courseListCollection})
    }
  })

  if(notFound){
    res.status(404)
    return res.json({
      error:{
        code:'NOT_FOUND',
        message:'ID not found'
      }
    })
  }
})

// afficher toutes les listes de course
router.get('/', (req,res,next) => {
  return res.json({data:courseListCollection})
})

// ajouter un item dans une liste de course
router.put('/', (req,res,next) => {
  if(!req.body.listID){
    res.status(400)
    return res.json({
      error:{
        code:'VALIDATION',
        message:'Missing listID'
      }
    })
  }
  if(!req.body.itemName){
    res.status(400)
    return res.json({
      error:{
        code:'VALIDATION',
        message:'Missing itemName'
      }
    })
  }
  let notFound = true;
  const listID = req.body.listID
  const itemName = req.body.itemName
  courseListCollection.forEach((item,index,object)=>{
    if(item.id === listID){
      notFound = false
      const result = find(item, { itemName })
      item.items.push({
        id:createUid(),
        item:itemName,
        bought:false
      })
      res.status(200)
      return res.json({data:item})
    }
  })
  if(notFound){
    res.status(404)
    return res.json({
      error:{
        code:'NOT_FOUND',
        message:'ID not found'
      }
    })
  }
})

// afficher tous les items d'une liste de course (par son nom)
router.get('/:list',(req,res,next) => {
  const list = req.params.list
  let notFound = true
  courseListCollection.forEach((item)=>{
    if(item.name === list){
      notFound = false
      res.status(200)
      return res.json({data:item.items})
    }
  })
  if(notFound){
    res.status(404)
    return res.json({
      error:'NOT_FOUND'
    })
  }
})

// acheter un item
router.put('/buy',(req,res,next)=>{
  if(!req.body.listID){
    res.status(400)
    return res.json({
      error:{
        code:'VALIDATION',
        message:'no listID passed'
      }
    })
  }
  if(!req.body.itemID){
    res.status(400)
    return res.json({
      error:{
        code:'VALIDATION',
        message:'no itemID passed'
      }
    })
  }
  const listID = req.body.listID
  const itemID = req.body.itemID
  let notFound = true
  courseListCollection.forEach((item)=>{
    if(item.id === listID){
      item.items.forEach((article)=>{
        if(article.id === itemID){
          notFound = false
          article.bought = true
          res.status(200)
          return res.json({data:article})
        }
      })
    }
  })
  if(notFound){
    res.status(404)
    return res.json({
      error:{
        code:'NOT_FOUND',
        message:'listID or itemID not found'
      }
    })
  }
})

// création UUIDV4 ( pas fait tout seul ca)
const tabHex = ['1','2','3','4','5','6','7','8','9','0','A','B','C','D','E','F']
const number = [8,4,4,4,12];

getRandomChar = () =>{
  return tabHex[Math.round(Math.random() * (tabHex.length-1))]
}

generateRandomString = (number) => {
  let id = '';
  for(let i = 1; i<=number; i++){
    let char = getRandomChar();
    id += char;
  }
  return id;
}

createUid = () => {
  let id = ''
  for (let i = 0; i < number.length ; i++){
    id += generateRandomString(number[i]);
    if((i+1) != number.length)
      id+='-';
}

  return id;
}


module.exports = router
