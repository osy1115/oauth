
//성별

let gender = "남자"; // 남 or 여

// 남자일경우 숫자 1 출력, 여자일경우 숫자 2 출력

// if문에서 == 만 활용할때 
switch(gender){
    case "남자":
        console.log(1);
    break;
    case "여자":
        console.log(2);
    break;
    case "남자1":
        console.log(1);
    break;
}


let 과일 = "고양이";

switch(과일){
    case "바나나":
        console.log("노랑")
    break;
    case "사과":
        console.log("빨강")
    break;
    case "참외":
        console.log("노랑")
    break;
    case "키위":
        console.log("초록")
    break;
    case "수박":
        console.log("초록")
    break;
    case "포도":
        console.log("검정")
    break;
    default:
        console.log("입력되지않는 과일입니다.")
}