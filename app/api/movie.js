var mongoose = require('mongoose')
var Movie = mongoose.model('Movie')
var Category = mongoose.model('Category')
var koa_request = require('koa-request')

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
                        genres:item.genres
                    })
                    movie = yield movie.save();
                    movies.push(movie)
                }
            })
        })
        yield queryArray
    }
    return movies
}