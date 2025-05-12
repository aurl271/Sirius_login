// 値が入るのを待機する関数
function waitForInputValue(inputElement, interval = 100) {
    return new Promise((resolve) => {
        const check = () => {
            if (inputElement && inputElement.value && inputElement.value.trim() !== "") {
                resolve();
            } else {
                setTimeout(check, interval);
            }
        };

        check();
    });
}


// chrome.runtime.sendMessage を Promise でラップ
function sendMessageToBackground(action) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action }, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        });
    });
}

// ページ読み込み時、自動実行
(async () => {
    const button1 = document.getElementsByClassName('btn btn-success sm mb-3');
    if (button1.length > 0) button1[0].click();

    await new Promise(resolve => setTimeout(resolve, 3000));

    // コードの取得を要求
    sendMessageToBackground("fetchCode");

    // input 要素を取得（1つ目の form-control）
    const input = document.getElementsByClassName('form-control')[0];

    // 値が入るのを待機
    await waitForInputValue(input);

    // ボタン2をクリック
    const button2 = document.getElementsByClassName('btn btn-info');
    if (button2.length > 0) button2[0].click();
})();

// window.postMessage を待ち受けてフォームに反映
window.addEventListener("message", (event) => {
    if (event.data.type === "AUTO_FILL_CODE") {
        const input = document.getElementsByClassName('form-control')[0];
        if (input) input.value = event.data.code;
    }
});
