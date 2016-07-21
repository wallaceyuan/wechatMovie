/**
 * Created by yuan on 2016/7/21.
 */
function* idMaker(){
    var index = 0;
    while(index < 3){
        yield index++;
    }
}
var gen = idMaker();

console.log(gen.next().value);
console.log(gen.next().value);
console.log(gen.next().value);
console.log(gen.next().value);