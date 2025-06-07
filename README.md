設定 Firebase

    前往 Firebase 控制台，建立一個新專案。
    https://console.firebase.google.com/u/0/
    在專案中，啟用 Authentication (驗證)。
        選擇「登入方式」分頁。
        啟用「電子郵件/密碼」提供者。
        前往「使用者」分頁，手動新增一位使用者。這位使用者的 Email 和密碼將是您的管理員帳號。
    啟用 Firestore Database (資料庫)。
        以「測試模式」建立資料庫即可（之後可以修改安全規則）。
    在專案設定中 (點擊左上角的齒輪圖示)，找到您的 Web 應用程式的 Firebase 設定物件 (firebaseConfig)。
    將程式碼中的 firebaseConfig 變數替換為您自己的設定。
    將程式碼中的 ADMIN_EMAIL 變數改為您剛剛建立的管理員 Email。****

```
使用 Firestore 實現安全的身分驗證

這個指南將教您如何設定一個安全、可靠的管理員驗證系統，避免在程式碼中暴露任何敏感資訊。
第一步：在 Firebase Authentication 找到您的管理員 UID

首先，您需要獲取您在 Firebase 中註冊的管理員帳號的唯一 User ID (UID)。

    前往您的 Firebase 控制台。

    進入您的專案，點選左側選單的 Authentication。

    在 Users 分頁中，您會看到您之前建立的管理員帳號。複製 User UID 欄位下的那串字元（例如 aBcDeFg12345...）。這就是您管理員帳號的唯一識別碼。

www.oxxostudio.tw
第二步：在 Firestore 中設定管理員角色

現在，我們將使用這個 UID 在 Firestore 中標記該使用者為管理員。

    在 Firebase 控制台，點選左側選單的 Firestore Database。

    點擊 + Start collection。

    在 Collection ID 中，輸入 admins。

    點擊 Next，然後點擊 + Add document。

    點擊 Document ID 欄位旁邊的 auto-ID，將其刪除，然後貼上您在第一步中複製的管理員 UID。

    在 Field 中輸入 isAdmin，Type 選擇 boolean，Value 選擇 true。

    點擊 Save。

現在，您的 Firestore 中就有一個 admins 集合，裡面有一個文件，其 ID 是您管理員的 UID，明確標示了這是一位管理員。
developers.google.com
第三步：設定 Firestore 安全規則 (非常重要！)

這是確保系統安全的關鍵一步。我們要設定規則，只允許使用者讀取這個 admins 列表，但絕對不允許任何使用者從網頁端修改它。管理員的新增或刪除只能由您手動在 Firebase 控制台完成。

    在 Firestore Database 頁面，切換到 Rules 分頁。

    用以下規則替換掉原有的內容：

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // 文章(Posts)的規則
    match /posts/{postId} {
      // 已發布的文章，任何人都可以讀取。
      // 未發布的文章或所有文章，只有管理員可以讀/寫。
      allow read: if resource.data.published == true || (request.auth != null && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true);
      allow create, update, delete: if request.auth != null && get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.isAdmin == true;
    }

    // 管理員(admins)集合的規則
    match /admins/{userId} {
      // 僅允許已登入的使用者讀取，以檢查自己的權限。
      allow read: if request.auth != null;
      
      // 不允許任何使用者從客戶端(網頁)進行寫入操作。
      allow write: if false; 
    }
  }
}

    點擊 Publish。

這些規則確保了您的權限系統是唯讀的，從根本上杜絕了被篡改的風險。

設定完成後，請使用下面更新後的 App.js 程式碼來完成您的應用。
```


cloudflare pages 部署按照以下方式設定 Build settings：

    Framework preset：保留為 None 或選擇一個最接近的 React 選項（但設為 None 進行手動設定最可靠）。
    Build command：手動輸入 npm run build
    Build output directory：手動輸入 build
