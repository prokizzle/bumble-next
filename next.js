let NEW_MESSAGES = ".has-notifications";
let YOUR_MOVE = ".contact__move-label";
let MESSAGE_LIST_CONTAINER = ".scroll__inner";
let allNext = [];
let matchIndex = 0;
let matchListLength = 0;
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}
let stillValid = (node) => {
  return node.offsetParent !== null;
  // return !![NEW_MESSAGES, YOUR_MOVE].find((selector) =>
  //   node.className.includes(selector.slice(1, -1))
  // );
};
function resetApp() {
  allNext = [];
  matchIndex = 0;
  matchListLength = 0;
}
let loadMoreMessages = () => {
  var objDiv = document.querySelector(MESSAGE_LIST_CONTAINER);
  objDiv.scrollTop = objDiv.scrollHeight;
};
let getAllConversations = () => {
  const moreConversations = [NEW_MESSAGES, YOUR_MOVE]
    .map((selector) => [...document.querySelectorAll(selector)])
    .flat()
    .filter(stillValid);
  return moreConversations;
};
let nextMatch = () => {
  const nextClass = [NEW_MESSAGES, YOUR_MOVE].find(
    (selector) => !!document.querySelector(selector)
  );
  const nextTarget = document.querySelector(nextClass);
  nextTarget.click();
};
let fn = (index) => {
  if (index) {
    matchIndex = index;
    allNext = [];
  }
  if (allNext.length < matchIndex) {
    window.setTimeout(() => {
      loadMoreMessages();
      moreConversations = getAllConversations();
      if (moreConversations.length <= allNext.length) matchIndex = 0;
      matchListLength = moreConversations.length;
      allNext = moreConversations.filter(stillValid);
      console.log({ allNext, matchIndex });
      fn();
    }, 1000);
  } else {
    const nextConvo = allNext[matchIndex];
    matchIndex++;
    console.log({ nextConvo, matchIndex });
    nextConvo ? nextConvo.click() : fn();
  }
};
document.addEventListener("keypress", ({ code }) => code === "Enter" && fn());
document.addEventListener("keypress", ({ code }) => code === "Escape" && fn(0));
