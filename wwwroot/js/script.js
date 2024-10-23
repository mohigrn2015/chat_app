$(document).ready(function () {

    console.log("Document is ready");

    //showModal();
    $('#loginModal').show();
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("../chathub", {
            transport: signalR.HttpTransportType.LongPolling
        })
        .build();
    connection.start().then(function () {
        console.log("Connection established.");
    }).catch(function (err) {
        console.error("Connection Error: ", err)
    });

    const $attachmentButton = $("#attachmentButton");
    const $fileInput = $("#fileInput");
    const $filePopup = $("#filePopup");
    const $fileNameDisplay = $("#fileNameDisplay");
    const $sendButton = $("#sendButton");
    const $fileSendButton = $("#fileSendButton");
    const $messageInput = $("#messageInput");
    const $chatMessages = $("#chatMessages");
    const $receiverList = $("#receiverList");

    let selectedFile = null;

    let uniqueBrowserId = localStorage.getItem('browserId');
    if (!uniqueBrowserId) {
        uniqueBrowserId = generateUniqueId();
        localStorage.setItem('browserId', uniqueBrowserId);
    }

    connection.on("receiveMessage", function (message, adminUserId, client_id) {

        loadMessagesById(client_id, adminUserId);
    });

    connection.on("updateReceiverList", function (receivers) {
        //updateReceiverList(receivers);
    });

    $attachmentButton.on('click', function () {
        $fileInput.click();
    });

    $fileInput.on('change', function () {
        selectedFile = $fileInput[0].files[0];
        if (selectedFile) {
            $fileNameDisplay.text(selectedFile.name);
            const buttonOffset = $attachmentButton.offset();
            $filePopup.css({
                display: 'block',
                top: buttonOffset.top - $filePopup.outerHeight() - 10,
                left: buttonOffset.left
            });
            $sendButton.hide();
            $fileSendButton.show();
        }
    });

    $fileSendButton.on('click', function () {
        sendFile();
    });

    let receiverId = '';

    $sendButton.on('click', async function () {
        const messageContent = $messageInput.val();
        var role_client_use = sessionStorage.getItem('role_client_use');
        var user_id_client_use = sessionStorage.getItem('user_id_client_use');
        var client_id_client_use = sessionStorage.getItem('client_id_client_use');

        var admin_user_role = sessionStorage.getItem('admin_user_role');
        var admin_user_id_admin_end = sessionStorage.getItem('admin_user_id_admin_end');
        var client_id_admin_end = sessionStorage.getItem('client_id_admin_end');

        if (role_client_use != null && role_client_use == 'Client' && role_client_use === 'Client') {
            if (messageContent) {

                const formData = new FormData();
                formData.append('userid', user_id_client_use);
                formData.append('content', messageContent);
                formData.append('fileName', '');
                formData.append('filePath', '');
                formData.append('browserOrSenderId', uniqueBrowserId);
                formData.append('clientUserId', client_id_client_use);
                formData.append('user_role', role_client_use);

                console.log("formData: ", formData);

                try {
                    const response = await fetch('/api/SendContentMessage', {
                        method: 'POST',
                        body: formData
                    });

                    loadMessagesById(client_id_client_use, user_id_client_use);

                    $messageInput.val('');

                    resetFilePopup();

                } catch (error) {
                    console.error('Error sending file:', error);
                }
            } else {
                console.warn('Message content or receiver ID is invalid');
            }
        } else if (admin_user_role != null && admin_user_role == 'Admin' && admin_user_role === 'Admin'){
            if (messageContent) {

                const formData = new FormData();
                formData.append('userid', admin_user_id_admin_end);
                formData.append('content', messageContent);
                formData.append('fileName', '');
                formData.append('filePath', '');
                formData.append('browserOrSenderId', uniqueBrowserId);
                formData.append('clientUserId', client_id_admin_end);
                formData.append('user_role', admin_user_role);

                console.log("formData: ", formData);

                try {
                    const response = await fetch('/api/SendContentMessage', {
                        method: 'POST',
                        body: formData
                    });

                    loadMessagesById(client_id_admin_end, admin_user_id_admin_end);

                    $messageInput.val('');

                    resetFilePopup();

                } catch (error) {
                    console.error('Error sending file:', error);
                }
            } else {
                console.warn('Message content or receiver ID is invalid');
            }
        }
    });

    $('#messageInput').on('keypress', function (e) {
        if (e.which === 13) {
            $('#sendButton').click();
        }
    });
    $('#loginButton').on('click', function () {
        //$('#alertModal').hide();
        $('#loginModal').show();
    });

    // Close Login Modal on cancel
    $('#cancelLogin').on('click', function () {
        $('#loginModal').hide();
        purposeSelection();

        //showModal();
    });

    $('#cancelButton').on('click', function () {
        $filePopup.hide();
        $fileSendButton.hide();
        $sendButton.show();
        $fileNameDisplay.text('No file selected');
        selectedFile = null;
    });
    async function sendFile() {
        if (selectedFile) {
            const formData = new FormData();
            formData.append('file', selectedFile);
            const fileName = selectedFile.name;
            formData.append('receiverId', receiverId);
            formData.append('content', '');
            formData.append('fileName', fileName);
            formData.append('filePath', '');
            formData.append('browserOrSenderId', uniqueBrowserId);

            try {
                const response = await fetch('/upload', {
                    method: 'POST',
                    body: formData
                });

                //const result = await response.json();
                //const filePath = result.filePath;

                //await connection.invoke("SendMessage", uniqueBrowserId, '', fileName, filePath, uniqueBrowserId);

                resetFilePopup();
            } catch (error) {
                console.error('Error sending file:', error);
            }
        }
    }

    function resetFilePopup() {
        $messageInput.val('');
        $fileInput.val('');
        selectedFile = null;
        $filePopup.hide();
        $sendButton.show();
        $fileSendButton.hide();
    }

    function generateUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function loadMessages() {

        var client_id = $('#client_id').val();

        $.ajax({
            url: '/api/GetMessage',
            type: 'GET',
            data: { user_id: receiverId, client_id: client_id },
            success: function (responses) {
                $chatMessages.empty();
                console.log("responses: ", responses);
                responses.forEach(function (message) {
                    displayMessage(message, message.user_id, message.client_id);
                });
            },
            error: function (err) {
                console.error('Error fetching messages', err);
            }
        });
    }

    function loadMessagesById(client_id, user_id) {

        //sessionStorage.setItem('client_userid', client_id);
        //sessionStorage.setItem('admin_userid', user_id);

        $.ajax({
            url: '/api/GetMessage',
            type: 'GET',
            data: { user_id: user_id, client_id: client_id }, // Corrected variable names
            success: function (responses) {
                $chatMessages.empty();
                console.log("responses: ", responses);
                responses.forEach(function (message) {
                    displayMessage(message, message.user_id, message.client_id);
                });
            },
            error: function (err) {
                console.error('Error fetching messages', err);
            }
        });
    }


    function displayMessage(message, receiverIdDb, sender) {

        //var client_id = $('#client_id').val();
        console.log("message: ", message);
        var messageClass = "";

        if (message.browser_id == uniqueBrowserId || message.browser_id === uniqueBrowserId) {
            messageClass = "message-sender";
        } else {
            messageClass = "message-receiver";
        }
        const messageHtml = `<div class="message-container"><div class="${messageClass}">${message.content}${message.filePath ? `<a href="${message.filePath}" target="_blank" style="text-decoration: none;">
                             ${message.fileName}</a><a href="${message.filePath}" download="${message.fileName}" style="text-decoration: none;"><i class="fas fa-download" style="margin-left: 5px; cursor: pointer;"></i></a>` : ""}</div>
                            </div>`;

        $chatMessages.append(messageHtml);
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);
        $('.chat-container').addClass('show-receiver-list');

    }

    function updateReceiverList(receivers) {
        const $receiverList = $('#receiverList');
        var storedUserId = sessionStorage.getItem('userid');
        var user_role = sessionStorage.getItem('user_role');
        var loggedin_userid = sessionStorage.getItem('admin_user_id_admin_end');
        $receiverList.empty();

        receivers.forEach(function (receiver) {
            const receiverItem = `<div class="receiver-item" data-id="${receiver.client_id}">${receiver.name}</div>`;
            $receiverList.append(receiverItem);
        });

        $('.chat-container').addClass('show-receiver-list');

        if (receivers.length > 0) {
            const firstReceiver = $receiverList.find('.receiver-item').first();
            const receiversId = firstReceiver.data('id');
            $('.receiver-item').removeClass('selected');
            firstReceiver.addClass('selected');
            receiverId = receiversId;

            loadMessagesById(receiverId, loggedin_userid);
        }

        $('.receiver-item').on('click', function () {

            const receiversId = $(this).data('id');            

            $('.receiver-item').removeClass('selected');
            $(this).addClass('selected');

            receiverId = receiversId;
            sessionStorage.setItem('client_id_admin_end', '');
            sessionStorage.setItem('client_id_admin_end', receiverId);

            loadMessagesById(receiverId, loggedin_userid);
        });
    }


    //function updateReceiverList(receivers) {
    //    const $receiverList = $('#receiverList');  

    //    const inputField1 = sessionStorage.getItem('name');
    //    const inputField2 = sessionStorage.getItem('email');

    //    $receiverList.empty();

    //    console.log("Test: ", receivers);

    //    const receiverItem1 = `<div class="receiver-item" data-id=${receivers.id}>${receivers.name}</div>`;
    //    $receiverList.append(receiverItem1);
    //    $('.chat-container').addClass('show-receiver-list');
    //    //receivers.forEach(function (item) {
    //    //    const receiverItem1 = `<div class="receiver-item" data-id=${item.id}>${item.name}</div>`;
    //    //    $receiverList.append(receiverItem1);
    //    //    $('.chat-container').addClass('show-receiver-list');
    //    //});
    //}
    
    function showModal() {
        $('#alertModal').show();
    }
    function hideModal() {
        $('#alertModal').hide();
    }
    $('#alertForm').on('submit', async function (event) {
        event.preventDefault();
        const name = $('#name').val();
        const email = $('#email').val();
        const password = $('#password').val();

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);

        try {
            await fetch('/saveData', {
                method: 'POST',
                body: formData
            });

            alert('Data saved successfully!');
            hideModal();
            purposeSelection();

        } catch (error) {
            console.error('Error saving data:', error);
            alert('Failed to save data.');
        }
    });


    function purposeSelection() {
        $.ajax({
            url: '/api/GetChatPurposes',
            type: 'GET',
            success: function (response) {
                response.forEach(function (item) {
                    var buttonHtml = '<button class="purpose-btn" data-purpose="' + item.purpose + '">' + item.text + '</button>';
                    $('.modal-content-purpose').append(buttonHtml);
                });

                $('.purpose-btn').click(function () {
                    var purpose = $(this).data('purpose');

                    $('#purposePopup').hide();

                    initializeChat(purpose);

                    //loadMessages();
                });

                $('#purposePopup').show();
            },
            error: function (error) {
                console.log("Error fetching purposes:", error);
            }
        });
    }

    $('#cancelAlert').on('click', function () {
        hideModal();
        purposeSelection();
    });

    $('.close').on('click', function () {
        hideModal();
        //purposeSelection();
    });
    $('.purpose-btn').on('click', function () {
        var purpose = $(this).data('purpose');
        $('#purposePopup').hide();
        initializeChat(purpose);
    });

    function initializeChat(purpose) {
        $.ajax({
            url: '/api/GetReceiversByPurpose',
            type: 'GET',
            data: { purpose: purpose, browserId: uniqueBrowserId },
            success: function (response) {
                console.log("Response received: ", response);

                var receivers = response.receivers;  // Access the receivers list
                var userResponse = response.userResponse;  // Access the user response data

                var firstUser = receivers[0];
                sessionStorage.setItem('user_id_client_use', firstUser.id);
                sessionStorage.setItem('client_id_client_use', userResponse.client_id);
                sessionStorage.setItem('role_client_use', "Client");

                // Update the receiver list and handle the user response as needed
                updateReceiverList(receivers);

                // Optionally, handle userResponse if needed
                console.log("User Response: ", userResponse);
            },
            error: function (error) {
                console.log("Error fetching receivers:", error);
            }
        });
    }


    //function initializeChat(purpose) {
    //    $.ajax({
    //        url: '/api/GetReceiversByPurpose',
    //        type: 'GET',
    //        data: { purpose: purpose, browserId: uniqueBrowserId },
    //        success: function (receivers) {

    //            console.log("receivers -: ", receivers);

    //            var firstUser = receivers[0];
    //            sessionStorage.setItem('user_id', firstUser.id);

    //            updateReceiverList(receivers);
    //        },
    //        error: function (error) {
    //            console.log("Error fetching receivers:", error);
    //        }
    //    });
    //}
    async function startSignalRConnection(clientId) {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("/chathub", {
                transport: signalR.HttpTransportType.LongPolling
            })
            .build();

        // Add event listeners before starting the connection
        //connection.on("receiveMessage", function (message) {
        //    displayMessage(message);
        //});

        try {
            await connection.start();
            console.log("Connection established for client:", clientId);

            // Optionally, send a message to let the server know the client is connected
            connection.invoke("OnUserConnected", clientId);
        } catch (err) {
            console.error("SignalR connection error:", err);
        }
    }
    $('#loginButton_submit').on('click', function (e) {
        e.preventDefault(); // Prevent form from submitting normally

        const usernames = $('#loginEmail').val();
        const passwords = $('#loginPassword').val();

        const requestData = {
            username: usernames,
            password: passwords
        };

        try {
            $.ajax({
                url: '../api/Login',
                type: 'POST',
                contentType: 'application/json', // Indicate JSON is being sent
                data: JSON.stringify(requestData), // Convert object to JSON string
                success: function (userResponse) {
                    console.log("userResponseList: ", userResponse);

                    // Check if there is at least one user in the response
                    if (userResponse.length > 0) {
                        // Fetch the first user
                        const firstUser = userResponse[0];
                        sessionStorage.setItem('admin_user_role', 'Admin');
                        sessionStorage.setItem('admin_user_id_admin_end', firstUser.admin_user_id);
                        sessionStorage.setItem('client_id_admin_end', firstUser.client_id);

                        console.log("single_response_list: ", firstUser);

                        $('#loginModal').hide();
                        hideModal();
                        $('.chat-container').show();

                        updateReceiverList(userResponse);

                        loadMessagesById(firstUser.client_id, firstUser.admin_user_id);
                        //sessionStorage.setItem('userid', firstUser.userid);
                    } else {
                        console.warn("No users found in response.");
                    }
                },
                error: function (error) {
                    console.log("Error logging in:", error);
                }
            });


        } catch (error) {
            console.error("Error logging in:", error);
        }
    });
    //$('#loginButton_submit').on('click', function () {
    //    const usernames = $('#loginEmail').val();
    //    const passwords = $('#loginPassword').val();               

    //    const formData = new FormData();
    //    formData.append('username', usernames);
    //    formData.append('password', passwords);

    //    try {
    //        $.ajax({
    //            url: '../api/Login',
    //            type: 'POST',
    //            contentType: 'application/json', 
    //            data: JSON.stringify(formData), // JSON data matches model
    //            success: function (userResponse) {
    //                console.log("response: ", userResponse);

    //                //$('#loginModal').hide();
    //                //hideModal();
    //                //$('.chat-container').show();
    //                //updateReceiverList(userResponse);
    //                //loadMessages();
    //            },
    //            error: function (error) {
    //                console.log("Error logging in:", error);
    //            }
    //        });
    //    } catch (error) {
    //        console.error("Error logging in:", error);
    //    }
    //});


});