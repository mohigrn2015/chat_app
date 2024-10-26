﻿$(document).ready(function () {

    console.log("Document is ready");

    //showModal();
    $('#loginModal').show();
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("../chathub", {
            transport: signalR.HttpTransportType.LongPolling
        })
        .build();
    //connection.start().then(function () {
    //    console.log("Connection established.");
    //}).catch(function (err) {
    //    console.error("Connection Error: ", err)
    //});


    async function startConnection() {
        try {
            await connection.start();
            document.getElementById("status").innerText = "Connected to the server!";
            console.log("SignalR Connected. Connection ID: " + connection.connectionId);
        } catch (err) {
            document.getElementById("status").innerText = "Connection failed!";
            console.error("Error while establishing connection: " + err);
            setTimeout(startConnection, 5000); // Retry connection after a few seconds if it fails
        }
    }

    // Connection status checking
    connection.onclose(async () => {
        document.getElementById("status").innerText = "Disconnected!";
        console.log("SignalR Disconnected.");
        await startConnection(); // Attempt to reconnect
    });

    // Start connection when the page loads
    startConnection();

    // Function to check if the connection is active
    function isConnected() {
        if (connection.state === signalR.HubConnectionState.Connected) {
            console.log("User is connected.");
            return true;
        } else {
            console.log("User is not connected.");
            return false;
        }
    }

    // Example of how to check connection state from browser
    document.getElementById("status").innerText = isConnected() ? "Connected" : "Not Connected";


    //connection.start().then(function () {
    //    console.log("Connection established.");
    //    // Now subscribe to the events
    //    connection.on("receiveMessage", function (message, adminUserId, client_id) {
    //        console.log("Message received:", message);
    //        loadMessagesById(client_id, adminUserId);
    //    });
    //}).catch(function (err) {
    //    console.error("Connection Error: ", err);
    //});

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

        loadMessagesById(adminUserId, client_id);
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

    $('#attachmentButton').on('keypress', function (e) {
        if (e.which === 13) {
            sendFile();
            $fileSendButton.hide();
            $sendButton.show();
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
        var client_conn_id = sessionStorage.getItem('client_connection_id');
        var admin_conn_id = sessionStorage.getItem('admin_connection_id');

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
                formData.append('admin_conn_id', admin_conn_id);
                formData.append('client_conn_id', client_conn_id);

                console.log("formData: ", formData);

                try {
                    const response = await fetch('/api/SendContentMessage', {
                        method: 'POST',
                        body: formData
                    });

                    loadMessagesById(user_id_client_use, client_id_client_use);

                    $messageInput.val('');

                    resetFilePopup();

                } catch (error) {
                    console.error('Error sending file:', error);
                }
            } else {
                console.warn('Message content or receiver ID is invalid');
            }
        } else if (admin_user_role != null && admin_user_role == 'Admin' && admin_user_role === 'Admin') {
            if (messageContent) {

                const formData = new FormData();
                formData.append('userid', admin_user_id_admin_end);
                formData.append('content', messageContent);
                formData.append('fileName', '');
                formData.append('filePath', '');
                formData.append('browserOrSenderId', uniqueBrowserId);
                formData.append('clientUserId', client_id_admin_end);
                formData.append('user_role', admin_user_role);
                formData.append('admin_conn_id', admin_conn_id);
                formData.append('client_conn_id', client_conn_id);

                console.log("formData: ", formData);

                try {
                    const response = await fetch('/api/SendContentMessage', {
                        method: 'POST',
                        body: formData
                    });

                    loadMessagesById(admin_user_id_admin_end, client_id_admin_end);

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

    $("#themeToggleButton").click(function () {
        $("body").toggleClass("dark-theme");
        // Add any other theme toggle logic here
    });

    $("#settingsButton").click(function () {
        // Add your settings button logic here
        alert("Settings button clicked!"); // Example action
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

        var role_client_use = sessionStorage.getItem('role_client_use');
        var user_id_client_use = sessionStorage.getItem('user_id_client_use');
        var client_id_client_use = sessionStorage.getItem('client_id_client_use');
        var admin_user_role = sessionStorage.getItem('admin_user_role');
        var admin_user_id_admin_end = sessionStorage.getItem('admin_user_id_admin_end');
        var client_id_admin_end = sessionStorage.getItem('client_id_admin_end');
        var client_conn_id = sessionStorage.getItem('client_connection_id');
        var admin_conn_id = sessionStorage.getItem('admin_connection_id');

        if (role_client_use != null && role_client_use == 'Client' && role_client_use === 'Client') {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const fileName = selectedFile.name;
                formData.append('userid', user_id_client_use);
                formData.append('content', '');
                formData.append('fileName', fileName);
                formData.append('filePath', '');
                formData.append('browserOrSenderId', uniqueBrowserId);
                formData.append('clientUserId', client_id_client_use);
                formData.append('user_role', admin_user_role);
                formData.append('admin_conn_id', admin_conn_id);
                formData.append('client_conn_id', client_conn_id);

                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    resetFilePopup();
                    loadMessagesById(user_id_client_use, client_id_client_use);

                } catch (error) {
                    console.error('Error sending file:', error);
                }
            }
        } else if (admin_user_role != null && admin_user_role == 'Admin' && admin_user_role === 'Admin') {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                const fileName = selectedFile.name;
                formData.append('userid', admin_user_id_admin_end);
                formData.append('content', '');
                formData.append('fileName', fileName);
                formData.append('filePath', '');
                formData.append('browserOrSenderId', uniqueBrowserId);
                formData.append('clientUserId', client_id_admin_end);
                formData.append('user_role', admin_user_role);
                formData.append('admin_conn_id', admin_conn_id);
                formData.append('client_conn_id', client_conn_id);

                try {
                    const response = await fetch('/upload', {
                        method: 'POST',
                        body: formData
                    });
                    resetFilePopup();
                    loadMessagesById(admin_user_id_admin_end, client_id_admin_end);

                } catch (error) {
                    console.error('Error sending file:', error);
                }
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
        var role_client_use = sessionStorage.getItem('role_client_use');
        var user_id_client_use = sessionStorage.getItem('user_id_client_use');
        var client_id_client_use = sessionStorage.getItem('client_id_client_use');

        var admin_user_role = sessionStorage.getItem('admin_user_role');
        var admin_user_id_admin_end = sessionStorage.getItem('admin_user_id_admin_end');
        var client_id_admin_end = sessionStorage.getItem('client_id_admin_end');

        if (role_client_use != null && role_client_use == 'Client' && role_client_use === 'Client') {
            $.ajax({
                url: '/api/GetMessage',
                type: 'GET',
                data: { user_id: user_id_client_use, client_id: client_id_client_use },
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
        } else if (admin_user_role != null && admin_user_role == 'Admin' && admin_user_role === 'Admin') {
            $.ajax({
                url: '/api/GetMessage',
                type: 'GET',
                data: { user_id: admin_user_id_admin_end, client_id: client_id_admin_end },
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
    }

    function loadMessagesById(user_id, client_id) {

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
                    displayMessage(message, user_id, client_id);
                });
            },
            error: function (err) {
                console.error('Error fetching messages', err);
            }
        });
    }

    function displayMessage(message, receiverIdDb, sender) {
        var messageClass = "";

        if (message.browser_id != uniqueBrowserId) {
            messageClass = "message-receiver";
        } else {
            messageClass = "message-sender";
        }

        // Remove prefix "=-==" from the file name if it exists
        let displayFileName = message.fileName ? message.fileName.split('=-==')[1] : "";

        // Construct the message HTML, only display content if it's not null or empty
        const messageHtml = `<div class="message-container">
                            <div class="${messageClass}">
                                ${message.content ? message.content : ""}
                                ${message.filePath ? `<a href="${message.filePath}" target="_blank" style="text-decoration: none;">${displayFileName}</a>
                                                     <a href="${message.filePath}" download="${displayFileName}" style="text-decoration: none;">
                                                     <i class="fas fa-download" style="margin-left: 5px; cursor: pointer;"></i></a>` : ""}
                            </div>
                         </div>`;

        // Append the message to the chat messages container
        $chatMessages.append(messageHtml);
        $chatMessages.scrollTop($chatMessages[0].scrollHeight);

        // Add class to show receiver list
        $('.chat-container').addClass('show-receiver-list');
    }

    function updateReceiverList(receivers) {
        const $receiverList = $('#receiverList');
        var storedUserId = sessionStorage.getItem('userid');
        var user_role = sessionStorage.getItem('user_role');
        var loggedin_userid = sessionStorage.getItem('admin_user_id_admin_end');
        $receiverList.empty();

        // Add a container for the header with buttons and text
        const header = `
    <div class="d-flex justify-content-between align-items-center mb-3" style="transition: box-shadow 0.3s ease;" onmouseover="this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.3)'" onmouseout="this.style.boxShadow='none'">
        <div class="quazarr-text" style="font-weight: bold; margin-left: 0; font-size: 2.25rem;">Quazarr</div>
        <div class="d-flex align-items-center">
            <button id="settingsButton" class="btn btn-light" title="Settings" style="width: 40px; height: 40px;">
                <i class="fas fa-cog"></i>
            </button>
            <button id="themeToggleButton" class="btn btn-light" title="Toggle Theme" style="width: 40px; height: 40px;">
                <i class="fas fa-adjust"></i>
            </button>
        </div>
    </div>
`;

        $receiverList.append(header);

        // Append receiver items
        receivers.forEach(function (receiver) {
            const receiverItem = `<div class="receiver-item" data-id="${receiver.client_id}">${receiver.name}</div>`;
            $receiverList.append(receiverItem);
        });

        $('.chat-container').addClass('show-receiver-list');

        var role_client_use = sessionStorage.getItem('role_client_use');
        var user_id_client_use = sessionStorage.getItem('user_id_client_use');
        var client_id_client_use = sessionStorage.getItem('client_id_client_use');

        var admin_user_role = sessionStorage.getItem('admin_user_role');
        var admin_user_id_admin_end = sessionStorage.getItem('admin_user_id_admin_end');
        var client_id_admin_end = sessionStorage.getItem('client_id_admin_end');

        // Client role logic
        if (role_client_use != null && role_client_use === 'Client') {
            sessionStorage.setItem('client_connection_id', connection.connectionId);

            if (receivers.length > 0) {
                const firstReceiver = $receiverList.find('.receiver-item').first();
                const receiversId = firstReceiver.data('id');
                $('.receiver-item').removeClass('selected');
                firstReceiver.addClass('selected');
                receiverId = receiversId;

                loadMessagesById(user_id_client_use, client_id_client_use);
            }

            $('.receiver-item').on('click', function () {
                const receiversId = $(this).data('id');

                $('.receiver-item').removeClass('selected');
                $(this).addClass('selected');

                receiverId = receiversId;
                sessionStorage.setItem('user_id_client_use', '');
                sessionStorage.setItem('user_id_client_use', receiverId);

                var user_id_client_using = sessionStorage.getItem('user_id_client_use');

                loadMessagesById(user_id_client_using, client_id_client_use);
            });
        }
        // Admin role logic
        else if (admin_user_role != null && admin_user_role === 'Admin') {
            sessionStorage.setItem('admin_connection_id', connection.connectionId);

            if (receivers.length > 0) {
                const firstReceiver = $receiverList.find('.receiver-item').first();
                const receiversId = firstReceiver.data('id');
                $('.receiver-item').removeClass('selected');
                firstReceiver.addClass('selected');
                receiverId = receiversId;

                loadMessagesById(admin_user_id_admin_end, client_id_admin_end);
            }

            $('.receiver-item').on('click', function () {
                const receiversId = $(this).data('id');

                $('.receiver-item').removeClass('selected');
                $(this).addClass('selected');

                receiverId = receiversId;
                sessionStorage.setItem('client_id_admin_end', '');
                sessionStorage.setItem('client_id_admin_end', receiverId);

                var client_id_admin_end_using = sessionStorage.getItem('client_id_admin_end');

                loadMessagesById(admin_user_id_admin_end, client_id_admin_end_using);
            });
        }
    }

    const themeToggleButton = $('#themeToggleButton');

    // Check localStorage for a saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        $('body').addClass(savedTheme);
    } else {
        $('body').addClass('light-theme'); // Default to light theme
    }

    // Theme toggle functionality
    themeToggleButton.on('click', function () {
        $('body').toggleClass('dark-theme light-theme');

        // Save the current theme in localStorage
        const currentTheme = $('body').hasClass('dark-theme') ? 'dark-theme' : 'light-theme';
        localStorage.setItem('theme', currentTheme);
    });



    //function updateReceiverList(receivers) {
    //    const $receiverList = $('#receiverList');
    //    var storedUserId = sessionStorage.getItem('userid');
    //    var user_role = sessionStorage.getItem('user_role');
    //    var loggedin_userid = sessionStorage.getItem('admin_user_id_admin_end');
    //    $receiverList.empty();

    //    receivers.forEach(function (receiver) {
    //        const receiverItem = `<div class="receiver-item" data-id="${receiver.client_id}">${receiver.name}</div>`;
    //        $receiverList.append(receiverItem);
    //    });

    //    $('.chat-container').addClass('show-receiver-list');

    //    var role_client_use = sessionStorage.getItem('role_client_use');
    //    var user_id_client_use = sessionStorage.getItem('user_id_client_use');
    //    var client_id_client_use = sessionStorage.getItem('client_id_client_use');

    //    var admin_user_role = sessionStorage.getItem('admin_user_role');
    //    var admin_user_id_admin_end = sessionStorage.getItem('admin_user_id_admin_end');
    //    var client_id_admin_end = sessionStorage.getItem('client_id_admin_end');

    //    if (role_client_use != null && role_client_use == 'Client' && role_client_use === 'Client') {

    //        sessionStorage.setItem('client_connection_id', connection.connectionId);

    //        if (receivers.length > 0) {
    //            const firstReceiver = $receiverList.find('.receiver-item').first();
    //            const receiversId = firstReceiver.data('id');
    //            $('.receiver-item').removeClass('selected');
    //            firstReceiver.addClass('selected');
    //            receiverId = receiversId;

    //            loadMessagesById(user_id_client_use, client_id_client_use);
    //        }

    //        $('.receiver-item').on('click', function () {

    //            const receiversId = $(this).data('id');

    //            $('.receiver-item').removeClass('selected');
    //            $(this).addClass('selected');

    //            receiverId = receiversId;
    //            sessionStorage.setItem('user_id_client_use', '');
    //            sessionStorage.setItem('user_id_client_use', receiverId);

    //            var user_id_client_using = sessionStorage.getItem('user_id_client_use');

    //            loadMessagesById(user_id_client_using, client_id_client_use);
    //        });
    //    } else if (admin_user_role != null && admin_user_role == 'Admin' && admin_user_role === 'Admin') {

    //        sessionStorage.setItem('admin_connection_id', connection.connectionId);

    //        if (receivers.length > 0) {
    //            const firstReceiver = $receiverList.find('.receiver-item').first();
    //            const receiversId = firstReceiver.data('id');
    //            $('.receiver-item').removeClass('selected');
    //            firstReceiver.addClass('selected');
    //            receiverId = receiversId;

    //            loadMessagesById(admin_user_id_admin_end, client_id_admin_end);
    //        }

    //        $('.receiver-item').on('click', function () {

    //            const receiversId = $(this).data('id');

    //            $('.receiver-item').removeClass('selected');
    //            $(this).addClass('selected');

    //            receiverId = receiversId;
    //            sessionStorage.setItem('client_id_admin_end', '');
    //            sessionStorage.setItem('client_id_admin_end', receiverId);

    //            var client_id_admin_end_using = sessionStorage.getItem('client_id_admin_end');

    //            loadMessagesById(admin_user_id_admin_end, client_id_admin_end_using);
    //        });
    //    }
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

                    loadMessages();
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
            data: { purpose: purpose, browserId: uniqueBrowserId, connection_id: connection.connectionId },
            success: function (response) {
                //console.log("Response received: ", response);

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
        const connect_id = connection.connectionId;

        const requestData = {
            username: usernames,
            password: passwords,
            connection_id: connect_id
        };

        try {
            $.ajax({
                url: '../api/Login',
                type: 'POST',
                contentType: 'application/json', // Indicate JSON is being sent
                data: JSON.stringify(requestData), // Convert object to JSON string
                success: function (userResponse) {
                    //console.log("userResponseList: ", userResponse);

                    // Check if there is at least one user in the response
                    if (userResponse.length > 0) {
                        // Fetch the first user
                        const firstUser = userResponse[0];
                        sessionStorage.setItem('admin_user_role', 'Admin');
                        sessionStorage.setItem('admin_user_id_admin_end', firstUser.admin_user_id);
                        sessionStorage.setItem('client_id_admin_end', firstUser.client_id);

                        //console.log("single_response_list: ", firstUser);

                        $('#loginModal').hide();
                        hideModal();
                        $('.chat-container').show();

                        updateReceiverList(userResponse);

                        loadMessagesById(firstUser.admin_user_id, firstUser.client_id);
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
});