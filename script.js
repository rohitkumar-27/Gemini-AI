

const  typingForm = document.querySelector(".typing-form");
const  chatList = document.querySelector(".chat-list");
const suggestions = document.querySelectorAll(".suggestion-list .suggestion");
const toggleThemeButton = document.querySelector("#toggle-theme-button");
const deleteChatButton = document.querySelector("#delete-chat-button");

let userMessage = null;
let isResponseGenerating = false;


//Api configuration
const API_URL=`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key= Enter your API Key`;


// storage data in localstorage
const loadLocalstorageData =()=>{
    const savedChats = localStorage.getItem("savedChats");
    const isLightMode = (localStorage.getItem("themeColor") === "light_mode");


    // apply the stored theme 
    document.body.classList.toggle("light_mode", isLightMode);
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";


    // restore saved chats
    chatList.innerHTML = savedChats || "";

    document.body.classList.toggle("hide-header", savedChats); 
    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom
}
loadLocalstorageData();




// create a new message element and return it
const createMessageElement =(content, ...classes)=>{
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}



// show typing effect displaying words one by one 
const showTypingEffect = (text, textElement, incomingMessageDiv) =>{
    const words = text.split(' ');
    let currentWordIndex = 0;

    const typingInterval = setInterval(()=>{
        // append each word to the text element with a space
        textElement.innerText += (currentWordIndex === 0 ? '': ' ') + words[currentWordIndex++];
        incomingMessageDiv.querySelector(".icon").classList.add("hide");
        
        // if all words are displayed 
        if(currentWordIndex === words.length) {
            clearInterval(typingInterval);
            isResponseGenerating = false;
            incomingMessageDiv.querySelector(".icon").classList.remove("hide");
            localStorage.setItem("savedChats", chatList.innerHTML); // save chats to local storage
        }
        chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom
    },75);
}




//fetch response from the api based on user message
const generateAPIResponse = async(incomingMessageDiv)=>{
    const textElement = incomingMessageDiv.querySelector(".text"); // get text element
    // send a post request to the api with the user message
    try{
        const response = await fetch(API_URL,{
            method:"post",
            headers: {"content-Type" : "appication/json"},
            body : JSON.stringify({
                contents:[{
                    role:"user",
                    parts: [{text: userMessage}]
                }]
            })
        });

        const result = await response.json();
        if(!response.ok) throw new Error(result.error.message);


        // get the api response text and remove asterisks from it
        const apiResponse = result?.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1');
        showTypingEffect(apiResponse, textElement, incomingMessageDiv);
        // textElement.innerText = apiResponse;
    }catch(error){
        isResponseGenerating = false;
        textElement.innerText = error.message;
        textElement.classList.add("error");
    }finally{
        incomingMessageDiv.classList.remove("loading");
    }

}



// show a loading animation while waiting for the API response
const showLoadingAnimation = () =>{
    const html = `<div class="message-content">
                    <img src="./images/logo2.png" alt="Gemini Image" class="avatar">
                    <p class="text"></p>
                    <div class="loading-indicator">
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                        <div class="loading-bar"></div>
                    </div>
                </div>
                <span onclick="copyMessage(this)" class=" icon material-symbols-rounded">content_copy</span>`;

const incomingMessageDiv =createMessageElement(html, "incoming", "loading");
chatList.appendChild(incomingMessageDiv);

chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom
generateAPIResponse(incomingMessageDiv);
}




//copy message from clipboard
const copyMessage = (copyIcon) =>{
    const messageText =  copyIcon.parentElement.querySelector(".text").innerText;

    navigator.clipboard.writeText(messageText);
    copyIcon.innerText = "done"; // show tick icon
    setTimeout(() => copyIcon.innerText = "content_copy", 1000); // revert icon after 1 second
}




// handle sending outgoing chat messages
const handleOutgoingchat =()=>{
    userMessage = typingForm.querySelector(".typing-input").value.trim() || userMessage;
    if(!userMessage || isResponseGenerating) return; // exit if there is no message

    isResponseGenerating = true;

    const html = `<div class="message-content">
                <img src="./images/p4.jpg" alt="User Image" class="avatar">
                <p class="text"></p>
            </div>`;

    const outgoingMessageDiv =createMessageElement(html, "outgoing");
    outgoingMessageDiv.querySelector(".text").innerText=userMessage;
    chatList.appendChild(outgoingMessageDiv);

    typingForm.reset(); // clear input field
    chatList.scrollTo(0, chatList.scrollHeight); // scroll to the bottom
    document.body.classList.add("hide-header"); // hide the header when chat is start
    setTimeout(showLoadingAnimation, 500); // show loading animation after a delay
}




// set usermessage and handle outgoing chat when a suggestion is clicked
suggestions.forEach(suggestion =>{
    suggestion.addEventListener("click", ()=>{
        userMessage = suggestion.querySelector(".text").innerText;
        handleOutgoingchat();
    })
})




// button for dark and light mode
toggleThemeButton.addEventListener("click", ()=>{
    const isLightMode = document.body.classList.toggle("light_mode");
    localStorage.setItem("themeColor", isLightMode ? "light_mode" : "dark_mode");
    toggleThemeButton.innerText = isLightMode ? "dark_mode" : "light_mode";
});



// delete saved chats from local storage and screen
deleteChatButton.addEventListener("click", ()=>{
    if(confirm("Are you sure you want to delete all messages ?")){
        localStorage.removeItem("savedChats");
        loadLocalstorageData();
    }
})




// prevent default from submission and handle outgoing chat
typingForm.addEventListener("submit", (e)=>{
    e.preventDefault();

    handleOutgoingchat();
});