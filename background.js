function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                reject(new Error(chrome.runtime.lastError.message));
            } else {
                resolve(token);
            }
        });
    });
}

chrome.runtime.onMessage.addListener(async (request, sender) => {
    if (request.action === 'fetchCode') {
        
        getAuthToken()
        .then(async (token) => {
            console.log("Access Token:", token);

            // トークンを使って Gmail API からメッセージを取得
            const response = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const subject = "Extic ログイン用ワンタイムパスワード";
            const encodedSubject = encodeURIComponent(subject);
            const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=subject:${encodedSubject}`, {
            headers: { Authorization: `Bearer ${token}` }
            });
            const list = await res.json();
            const msgId = list.messages?.[0]?.id;
            if (!msgId) return;

            const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const msgData = await msgRes.json();
            const msg = msgData["snippet"]
            const match = msg.match(/ワンタイムパスワード\s*:\s*(\d{6})/);
            const code = match?.[1];

            if (code) {
                chrome.scripting.executeScript({
                    target: { tabId: sender.tab.id },
                    func: (code) => {
                        window.postMessage({ type: "AUTO_FILL_CODE", code }, "*");
                    },
                    args: [code]
                });
            }
        })
        .catch((error) => {
            console.error("Auth error:", error.message);
        });
    }
});
