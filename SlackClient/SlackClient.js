window.onload = () => {
	const button = document.querySelector("#btnStart");
	button.addEventListener("click", () => {
		// 前回取得したデータクリア
		const messagesContainer = document.querySelector(".messagesContainer");
		messagesContainer.textContent = null;
		
		// メッセージ取得開始
		// 同期版
		getMessages();
		// 非同期版
		// getMessagesAsync();
	});
};

const getMessages = (latest = null) => {
	const request = new XMLHttpRequest();
	// 同期でRequest送信
	request.open("GET", createUrl(latest), false);
	request.send(null);

	if (request.status === 200) {
		const response = JSON.parse(request.responseText);
		displayMessages(response);

		// 全件取得できていない場合は残りの分を再帰で取得
		if (response.has_more) {
			const messageCount = response.messages.length;
			const oldestTimeStamp = response.messages[messageCount - 1].ts;
			getMessages(oldestTimeStamp);
		}
	}
};

const getMessagesAsync = (latest = null) => {
	const request = new XMLHttpRequest();
	request.onload = () => {
		const response = JSON.parse(request.responseText);
		displayMessages(response);

		// 全件取得できていない場合は残りの分を再帰で取得
		if (response.has_more) {
			const messageCount = response.messages.length;
			const oldestTimeStamp = response.messages[messageCount - 1].ts;
			getMessagesAsync(oldestTimeStamp);
		}
	}

	// 非同期でRequest送信
	request.open("GET", createUrl(latest), true);
	request.send(null);
};

const createUrl = (latest) => {
	const token = "xoxp-380106888994-381209183639-629350089367-9097b75a7be05d121d50ba0f4ee19b2";
	const channelID = "CB74M5Y6B";
	let url = `https://slack.com/api/channels.history?token=${token}&channel=${channelID}&count=10`;
	if (latest === null) {
		url += `&latest=${Date.now()}`;
	} else {
		url += `&latest=${latest}`;
	}

	return url;
};

const displayMessages = response => {
	if (!response.ok) {
		alert(response.error);
	}

	const pageElement = document.createElement("div");
	pageElement.className = "page";

	// 新しいものから格納されているので、リストの最後から見ていく
	const messageCount = response.messages.length;
	for (let i = messageCount - 1; i >= 0; i--) {
		// 投稿時間
		const timeElement = document.createElement("div");
		timeElement.className = "time";
		timeElement.textContent = new Date(response.messages[i].ts * 1000).toLocaleString();
		
		// メッセージ本文
		const messageElement = document.createElement("div");
		messageElement.className = "message";
		messageElement.textContent = response.messages[i].text;

		// メッセージを囲む枠
		const rowElement = document.createElement("div");
		rowElement.className = "row";
		rowElement.appendChild(timeElement);
		rowElement.appendChild(messageElement);
		
		pageElement.appendChild(rowElement);
	}

	const messagesContainer = document.querySelector(".messagesContainer");
	if (messagesContainer.childElementCount === 0) {
		messagesContainer.appendChild(pageElement);
	} else {
		// 先頭に追加
		messagesContainer.insertBefore(pageElement, messagesContainer.children[0]);
	}
};