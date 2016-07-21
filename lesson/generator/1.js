/**
 * Created by yuan on 2016/7/21.
 */
//这个对象有一个方法叫做 next()。每当你调用 next() 的时候，generator函数内部就会执行直到遇到下一个 yield 语句，然后暂停在那里，并返回一个对象。这个对象含有被 yield 的值和generator函数的运行状态。
function* genFunc () {
    console.log('step 1')
    yield 1
    console.log('step 2')
    yield 2
    console.log('step 3')
    return 3
}

var gen = genFunc();

//var ret = gen.next()

var ret = gen.next()
console.log(ret.value)
console.log(ret.done)


ret = gen.next()
console.log(ret.value)
console.log(ret.done)


