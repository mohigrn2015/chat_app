using ChatApp.BLL;
using ChatApp.DB;
using ChatApp.Models;
using ChatApp.Models.RequestModel;
using ChatApp.Models.ResponseModel;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp
{
    public class ChatHub : Hub
    {
        private readonly IHubContext<ChatHub> _hubContext;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private static Dictionary<string, string> _userConnections = new Dictionary<string, string>();

        public ChatHub(IHubContext<ChatHub> hubContext, IHttpContextAccessor httpContextAccessor)
        {
            _hubContext = hubContext;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task SendMessage(int receiverId, string content, string fileName, string filePath, string browserOrSenderId, int sender, string roleName, string connectionId)
        {
            UserResponseModel userResponseModel = new UserResponseModel();
            try
            {
                var message = new Message
                {
                    SenderId = sender,
                    ReceiverId = receiverId,
                    Content = content,
                    Timestamp = DateTime.UtcNow,
                    FilePath = filePath,
                    BrowserId = browserOrSenderId,
                    FileName = fileName
                };

                try
                {
                    await _hubContext.Clients.Client(connectionId).SendAsync("receiveMessage", message, receiverId, sender);
                    
                    
                    //if (!String.IsNullOrEmpty(roleName))
                    //{
                    //    if (roleName == "Admin")
                    //    {

                    //        await _hubContext.Clients.Client(connectionId).SendAsync("receiveMessage", message, receiverId, sender);
                    //    }
                    //    else if (roleName == "Client")
                    //    {
                    //        if (_userConnections.TryGetValue(receiverId.ToString(), out string connectionId))
                    //        {
                    //            // Send message to the specific receiver's connection
                    //            await _hubContext.Clients.Client(connectionId).SendAsync("receiveMessage", message, receiverId, sender);
                    //        }
                    //        else
                    //        {
                    //            Console.WriteLine($"Receiver with ID {receiverId} is not connected.");
                    //        }
                    //    }
                    //}
                }
                catch (Exception ex)
                {
                    // Log the error for debugging purposes
                    Console.WriteLine($"Error in SendMessage: {ex.Message}");
                    throw new HubException("An error occurred while sending the message.");
                }
            }
            catch (Exception)
            {
                throw;
            }
        }


        //public async Task SendMessage(int receiverId, string content, string fileName, string filePath, string browserOrSenderId, int sender)
        //{
        //    UserResponseModel userResponseModel = new UserResponseModel();
        //    try
        //    {
        //        var message = new Message
        //        {
        //            SenderId = sender,
        //            ReceiverId = receiverId,
        //            Content = content,
        //            Timestamp = DateTime.UtcNow,
        //            FilePath = filePath,
        //            BrowserId = browserOrSenderId,
        //            FileName = fileName
        //        };
        //        try
        //        {
        //            if (!string.IsNullOrEmpty(receiverId.ToString()))
        //            {
        //                await _hubContext.Clients.All.SendAsync("receiveMessage", message, receiverId, sender);
        //                //await Clients.User(receiverId.ToString()).SendAsync("receiveMessage", message);
        //            }
        //            else
        //            {
        //                await _hubContext.Clients.All.SendAsync("receiveMessage", message);
        //            }
        //        }
        //        catch (Exception ex)
        //        {
        //            // Log the error for debugging purposes
        //            Console.WriteLine($"Error in SendMessage: {ex.Message}");
        //            throw new HubException("An error occurred while sending the message.");
        //        }
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //}

        public async Task OnUserConnected(string clientId)
        {
            if (!string.IsNullOrEmpty(clientId) && !_userConnections.ContainsKey(clientId))
            {
                _userConnections[clientId] = Context.ConnectionId;
                Console.WriteLine($"Client {clientId} connected with connection ID {Context.ConnectionId}");
            }
            await Clients.All.SendAsync("UserConnected", clientId);
        }


        // Override the OnDisconnectedAsync to remove the user from the dictionary when they disconnect
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            // Find and remove the user by their connection ID
            var user = _userConnections.FirstOrDefault(x => x.Value == Context.ConnectionId);
            if (user.Key != null)
            {
                _userConnections.Remove(user.Key);
                Console.WriteLine($"Client {user.Key} disconnected");
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task UpdateReceiverList(IEnumerable<Receiver> receivers)
        {

            await _hubContext.Clients.All.SendAsync("updateReceiverList", receivers);
        }

        //public async Task MarkMessageAsSeen(int messageId)
        //{
        //    var message = await _context.Messages.FindAsync(messageId);
        //    if (message != null)
        //    {
        //        message.IsSeen = true;
        //        _context.Messages.Update(message);
        //        await _context.SaveChangesAsync();
        //        await Clients.User(message.SenderId).SendAsync("MessageSeen", messageId);
        //    }
        //}
    }


}
