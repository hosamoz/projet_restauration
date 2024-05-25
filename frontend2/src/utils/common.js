function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};
function onError(err) {
    let messageBoard = document.querySelector("#messageBoard");
    let errorMessage = err.message;
    messageBoard.innerText = errorMessage;
    messageBoard.classList.add("d-block");
};
function handleStarRating(note) {
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        if (i >= Math.round(note)) {
            starsHtml += '<span class="fa fa-star "></span>';
        } else {
            starsHtml += '<span class="fa fa-star checked"></span>';
        }
    }
    return starsHtml;
}

export { formatDate, onError, handleStarRating };