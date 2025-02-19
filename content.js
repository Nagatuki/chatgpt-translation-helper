const translationToggleId = 'translationToggle';
const translationTableId = 'translationTable';
const translationTableBodyId = 'translationTableBody';

let debounceTimer = null;

// トグルボタンを作成して右上に追加
function createToggleButton() {
    const selector = 'div[class*="@container/thread"] > div > div > div > div[class*="leading-[0]"]';
    const targetContainer = document.querySelector(selector);
    if (!targetContainer) return;
    if (document.getElementById(translationToggleId)) return;

    // トグルボタンの作成
    const toggleButton = document.createElement('button');
    toggleButton.id = translationToggleId;
    toggleButton.innerText = '翻訳表示: オフ';
    toggleButton.classList.add(
        'btn',
        'relative',
        'btn-secondary',
        'text-token-text-primary',
        'translation-toggle'
    );

    // トグルボタンのイベント設定
    toggleButton.addEventListener('click', () => {
        const isActive = toggleButton.classList.toggle('active');
        toggleButton.innerText = isActive ? '翻訳表示: オン' : '翻訳表示: オフ';
        localStorage.setItem(translationToggleId, isActive);

        if (isActive) {
            arrangeChatLayout();
        } else {
            resetChatLayout();
        }
    });

    // トグルボタンを右上に追加（既存要素の先頭に挿入）
    targetContainer.insertBefore(toggleButton, targetContainer.firstChild);
}

// 結果表示用のテーブルを作成して追加
function createTable() {
    // ChatGPTのメインコンテナ
    const chatContainer = document.querySelector('div[class*="@container/thread"] > div > div');
    if (!chatContainer) return;
    if (document.getElementById(translationTableId)) return;

    // テーブル作成
    const table = document.createElement('table');
    table.id = translationTableId;
    table.hidden = true;

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>原文</th><th>訳文</th>';
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    tbody.id = translationTableBodyId;
    table.appendChild(tbody);

    // メインコンテナに追加
    chatContainer.appendChild(table);
}

// 左右分割表示のレイアウト（記事をテーブルに再配置）
function arrangeChatLayout() {
    // ChatGPTのメインコンテナ取得
    const chatContainer = document.querySelector('div[class*="@container/thread"] > div > div');
    if (!chatContainer) return;

    // 既存の記事を非表示にする
    const articleContainerList = document.querySelectorAll('div[class*="@container/thread"] > div > div > article');
    articleContainerList.forEach(e => e.hidden = true);

    // 翻訳表示用テーブルを表示（なければ作成）
    if (!document.getElementById(translationTableId)) {
        createTable();
    }
    const table = document.getElementById(translationTableId);
    table.hidden = false;

    // テーブル内の tbody を空にする
    const tbody = document.getElementById(translationTableBodyId);
    tbody.innerHTML = '';

    // articleタグを2件ずつ（左：原文、右：訳文）テーブルの1行に配置
    for (let i = 0; i < articleContainerList.length; i += 2) {
        const leftArticle = articleContainerList[i].cloneNode(true);
        // 右側の記事が存在しなければ null になるので条件分岐
        const rightArticle = articleContainerList[i + 1] ? articleContainerList[i + 1].cloneNode(true) : null;

        // 原文の幅を広げる
        const div = leftArticle.querySelector(':scope > div > div > div > div > div > div > div > div')
        div.classList.remove('max-w-[var(--user-chat-width,70%)]')
        div.classList.add('max-w-[var(--user-chat-width,100%)]')

        // 表示用に hidden 属性を解除
        leftArticle.hidden = false;
        if (rightArticle) rightArticle.hidden = false;

        const row = document.createElement('tr');

        const leftCell = document.createElement('td');
        leftCell.classList.add('original-text');
        leftCell.appendChild(leftArticle);
        row.appendChild(leftCell);

        const rightCell = document.createElement('td');
        rightCell.classList.add('translated-text');
        if (rightArticle) {
            rightCell.appendChild(rightArticle);
        }
        row.appendChild(rightCell);

        tbody.appendChild(row);
    }
}

// 通常表示に戻す（テーブルを非表示、元の記事を表示）
function resetChatLayout() {
    const chatContainer = document.querySelector('div[class*="@container/thread"] > div > div');
    if (!chatContainer) return;

    // 元の記事を再表示
    const articleContainerList = document.querySelectorAll('div[class*="@container/thread"] > div > div > article');
    articleContainerList.forEach(e => e.hidden = false);

    // テーブルが存在すれば非表示にする
    const table = document.getElementById(translationTableId);
    if (table) {
        table.hidden = true;
    }
}

// トグル状態を読み込んで適用
function applySavedToggleState() {
    const isActive = localStorage.getItem(translationToggleId) === 'true';
    const toggleButton = document.getElementById(translationToggleId);
    if (!toggleButton) return;
    if (isActive) {
        toggleButton.classList.add('active');
        toggleButton.innerText = '翻訳表示: オン';
        arrangeChatLayout();
    } else{
        toggleButton.classList.remove("active")
        toggleButton.innerText = '翻訳表示: オフ';
        resetChatLayout();
    }
}

// MutationObserver のコールバック（debounceで呼び出し）
const observer = new MutationObserver(() => {
    // トグルボタンが存在しなければ作成
    createToggleButton();

    observer.disconnect();
    applySavedToggleState();
    observer.observe(document.body, { childList: true, subtree: true }); 
});

// 初回ロード時の処理
window.addEventListener('load', () => {
    createToggleButton();
    createTable();
    applySavedToggleState();
    arrangeChatLayout();
    observer.observe(document.body, { childList: true, subtree: true });
});
