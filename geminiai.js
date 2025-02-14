let datavalue = document.querySelector("#text")
let carddata = document.querySelector("#card")


async function getInfo() {

    const data1 = {"contents":[{"parts":[{"text":datavalue.value}]}]}

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=Enter your Api Key",
        {
            method:"post",
            headers: {"content-type" : "appication/json"},
            body : JSON.stringify(data1)
        }
    );

    const result = await response.json();


    const finalResult = result.candidates[0].content.parts[0].text;

    // console.log(finalResult);

    carddata.innerText = finalResult;
    
}