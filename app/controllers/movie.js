
'use strict'

var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var Comment = mongoose.model('Comment')
var _ = require('lodash')
var fs = require('fs')
var path = require('path')

// detail page
exports.detail = function *(next) {

  var id = this.params.id
  if(id == 'undefined') return
  yield Movie.update({_id: id}, {$inc: {pv: 1}}).exec()

  var movie = yield Movie.findOne({_id: id}).exec()
  console.log(movie);
  var comments = yield Comment
      .find({movie: id})
      .populate('from', 'name')
      .populate('reply.from reply.to', 'name')
      .exec()

  yield this.render('pages/detail', {
    title: 'imooc 详情页',
    movie: movie,
    comments: comments
  })

}

// admin new page
exports.new = function *(next) {
  var categories = yield Category.find({}).exec()
  yield this.render('pages/admin', {
    title: 'imooc 后台录入页',
    categories: categories,
    movie: {}
  })
}

// admin update page
exports.update = function *(next) {
  var id = this.request.params.id

  if (id) {
    var movie = yield Movie.findOne({_id: id}).exec()

    var categories = yield Category.find({}).exec()
    yield this.render('pages/admin', {
      title: 'imooc 后台更新页',
      movie: movie,
      categories: categories
    })
  }
}

// admin poster
/*
exports.savePoster = function *(next) {
  var posterData = this.request.files.uploadPoster
  var filePath = posterData.path
  var originalFilename = posterData.originalFilename

  if (originalFilename) {
    var data = yield fs.readFile(filePath)
    var timestamp = Date.now()
    var type = posterData.type.split('/')[1]
    var poster = timestamp + '.' + type
    var newPath = path.join(__dirname, '../../', '/public/upload/' + poster)
    yield fs.writeFile(newPath, data)

    this.request.poster = poster
    yield next
  }
  else {
    yield next
  }
}
*/

// admin post movie
exports.save = function *(next) {
  var id = this.request.body.movie._id
  var movieObj = this.request.body.movie
  var _movie

  if (this.request.poster) {
    movieObj.poster = this.request.poster
  }

  if (id) {
    var movie = yield Movie.findOne({_id: id}).exec()
    _movie = _.extend(movie, movieObj)
    yield _movie.save()
    this.redirect('/movie/' + movie._id)
  }
  else {
    _movie = new Movie(movieObj)

    var categoryId = movieObj.category
    var categoryName = movieObj.categoryName

    var movie = yield  _movie.save()

    if (categoryId) {

      var category = yield Category.findOne({_id: categoryId}).exec()

      category.movies.push(movie._id)

      yield category.save()
      this.redirect('/movie/' + movie._id)
      yield next
    }
    else if (categoryName) {
      var category = yield new Category({
        name: categoryName,
        movies: [movie._id]
      })
      yield category.save()
      movie.category = category._id
      yield movie.save()
      this.redirect('/movie/' + movie._id)
    }
  }
}

// list page
exports.list = function *(next) {
  var movies = yield Movie.find({})
    .populate('category', 'name')
    .exec()

   yield this.render('pages/list', {
    title: 'imooc 列表页',
    movies: movies
  })
}

// list page
exports.del = function *(next) {
  var id = this.query.id

  if (id) {
    try{
      yield Movie.remove({_id: id}).exec()
      this.body = {success: 1}
    }catch(err){
      //res.json({success: 0})
      this.body = {success: 0}
    }
  }
}