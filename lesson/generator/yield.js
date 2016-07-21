/**
 * Created by yuan on 2016/7/21.
 */
function* anotherGenerator(i){
    yield i+1;
    yield i+2;
    yield i+3;
}

function* generator(i){
    yield i;
    yield* anotherGenerator(i);
    yield i + 10;
}

var gen = generator(10);

console.log(gen.next().value); // 10
console.log(gen.next().value); // 11
console.log(gen.next().value); // 12
console.log(gen.next().value); // 13
console.log(gen.next().value); // 20
console.log(gen.next().value); //undefined