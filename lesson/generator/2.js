/**
 * Created by yuan on 2016/7/21.
 */
//同时，iterator对象的 next() 方法是可以传递一个参数的。这个参数将会成为generator函数内对应 yield 语句的返回值：
function* genFunc () {
    var result = yield 1
    console.log(result)
}
var gen = genFunc()
gen.next() // 此时generator内部执行到 yield 1 并暂停，但还未对result赋值！
// 即使异步也可以！
setTimeout(function () {
    gen.next(123) // 给result赋值并继续执行，输出: 123
}, 1000)