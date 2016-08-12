
'use strict'

var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var koa_request = require('koa-request')
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var _ = require('lodash');
var co = require('co');
// index page
exports.findAll = function *() {
    var category = yield Category
        .find({})
        .populate({
            path: 'movies',
            select: 'title poster',
            options: { limit: 6 }
        })
        .exec()
    return category
}

// search page
exports.searchByCategory = function *(catId) {
    var categories = yield Category
        .find({_id:catId})
        .populate({
            path: 'movies',
            select: 'title poster',
        })
        .exec()
    return categories
}

exports.searchByName = function *(q) {
    var movies = yield Movie
        .find({title:new RegExp(q+'.*','i')})
        .exec()
    return movies
}

exports.searchById = function *(id) {
    var movie = yield Movie
        .findOne({_id:id})
        .exec()
    return movie
}

function updateMovies(movie){
    var options = {
        url:'https://api.douban.com/v2/movie/subject/'+movie.doubanId,
        json:true
    }
    request(options).then(function(response){
        var data = response.body;
        if(data.code == 5000) return

        _.extend(movie,{
            coutry:data.countries[0],
            summary:data.summary
        })
        var genres = data.genres
        if(genres && genres.length > 0){
            var cateArray = []
            genres.forEach(function(genre){
                cateArray.push(function *(){
                    var cate =  yield Category.findOne({name: genre}).exec();
                    if(cate){
                        cate.movies.push(movie._id)
                        movie.save(cate)
                    }else{
                        var cat = new Category({
                            name: genre,
                            movies: [movie._id]
                        })
                        cat = cat.save()
                        movie.category = cat._id
                        yield movie.save()
                    }
                })
            });

            co(function *(){
                yield cateArray
            })
        }else{
            movie.save()
        }
    });
}

exports.searchByDouban = function *(q){
    var options = {
        url:'https://api.douban.com/v2/movie/search?q=',
        json:true
    }
    options.url += encodeURIComponent(q)
    var reponse = yield koa_request(options)
    var _data = reponse.body;
    var subjects = []
    var movies = []
    if(_data && _data.subjects){
        subjects = _data.subjects
    }
    if(subjects.length > 0){
        var queryArray = []
        subjects.forEach(function(item){
            queryArray.push(function *(){
                var movie = yield Movie.findOne({doubanId: item.id})
                if(movie){
                    movies.push(movie)
                }else{
                    var directors = item.directors || []
                    var director = directors[0] || ""

                    movie = new Movie({
                        director: director.name || "",
                        title: item.title,
                        doubanId: item.id,
                        poster: item.images.large,
                        year: item.year,
                        genres:item.genres,

                    })
                    movie = yield movie.save();
                    movies.push(movie)
                }
            })
        })

        yield queryArray

        movies.forEach(function(movie){
            updateMovies(movie)
        });
    }


    return movies
}