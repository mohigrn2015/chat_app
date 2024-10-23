using ChatApp.BLL;
using ChatApp.DAL;
using ChatApp.Models;
using ChatApp.Models.RequestModel;
using ChatApp.Models.ResponseModel;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection;

namespace ChatApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ChatHub _chatHub;

        public HomeController(ILogger<HomeController> logger, IHttpContextAccessor httpContextAccessor, ChatHub chatHub)
        {
            _logger = logger;
            _httpContextAccessor = httpContextAccessor;
            _chatHub = chatHub;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        [Route("api/Login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestModel formData)
        {
            BLLAuthentication bLLAuthentication = new BLLAuthentication();
            try
            {
                // Simulated user data response
                List<UserInfoRespModel> userResponse = new List<UserInfoRespModel>();
                //{
                //    new UserInfoRespModel() { id = 1000, name = "Mohiuddin" },
                //    new UserInfoRespModel() { id = 1001, name = "Fahim Ahmed" }
                //};
                userResponse = bLLAuthentication.GetUserInformation(formData);

                //var httpContext = _httpContextAccessor.HttpContext;

                //if (httpContext != null)
                //{
                //    httpContext.Session.SetString("user_role", userResponseModel.client_name);
                //    httpContext.Session.SetString("client_email", userResponseModel.client_email);
                //    httpContext.Session.SetString("session_client_id", userResponseModel.client_id.ToString());
                //}

                return Ok(userResponse);
            }
            catch (Exception)
            {
                return StatusCode(500, "Internal server error");
            }
        }

        //[HttpPost]
        //[Route("api/Login")]
        //public async Task<IActionResult> Login([FromForm] LoginRequestModel formData)
        //{
        //    BLLAuthentication bLLAuthentication = new BLLAuthentication();
        //    try
        //    {
        //        List<UserInfoRespModel> userResponse = new List<UserInfoRespModel>();
        //        //userResponse = _userService.ValidateUser(request.Username, request.Password);
        //        userResponse = new List<UserInfoRespModel>()
        //        {
        //            new UserInfoRespModel()
        //            {
        //                id = 1000,
        //                name = "Mohiuddin",
        //            },
        //            new UserInfoRespModel()
        //            {
        //                id = 1001,
        //                name = "Fahim Ahmed",
        //            }
        //        };

        //        //userResponse = bLLAuthentication.GetUserInformation(username, password);

        //        return Ok(userResponse);
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //}

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, int receiverId, string content, string fileName, string filePath, string browserOrSenderId)
        {
            try
            {
                int sender = 0;
                string s_id = string.Empty;

                if (_httpContextAccessor.HttpContext != null)
                {
                    int clientId = Convert.ToInt32(_httpContextAccessor.HttpContext.Session.GetString("session_client_id"));
                    if (clientId <= 0)
                    {
                        //SaveDataFirstUser(browserOrSenderId, "", "", 0);
                        s_id = _httpContextAccessor.HttpContext.Session.GetString("session_client_id");
                        sender = Convert.ToInt32(s_id);
                    }
                    else
                    {
                        sender = clientId;
                    }
                }
                else
                {
                    //SaveDataFirstUser(browserOrSenderId, "", "", 0);
                    s_id = _httpContextAccessor.HttpContext.Session.GetString("session_client_id");
                    sender = Convert.ToInt32(s_id);
                }

                if (file != null && file.Length > 0)
                {
                    filePath = Path.Combine("wwwroot", "uploads", file.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                    filePath = "/uploads/" + file.FileName;

                    await _chatHub.SendMessage(receiverId, "", fileName, filePath, browserOrSenderId, sender);

                    return Ok();
                }
                else
                {
                    return BadRequest("Invalid file.");
                }
            }
            catch (Exception)
            {
                throw;
            }
        }

        [HttpPost("saveData")]
        public async Task<IActionResult> SaveData([FromForm] string name, string email, string password)
        {
            BLLAuthentication bLLAuthentication = new BLLAuthentication();
            UserResponseModel userResponseModel = new UserResponseModel();
            if (string.IsNullOrWhiteSpace(name) || string.IsNullOrWhiteSpace(email))
            {
                return BadRequest("Invalid input.");
            }

            try
            {
                var dataEntry = new ClientSaveReqModel
                {
                    name = name,
                    email = email,
                    password = password
                };
                userResponseModel = bLLAuthentication.SaveClientData(dataEntry);

                HttpContext.Session.SetString("client_name",userResponseModel.client_name);
                HttpContext.Session.SetString("client_email",userResponseModel.client_email);
                HttpContext.Session.SetString("session_client_id",userResponseModel.client_id.ToString());

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving data: {ex.Message}");
                return StatusCode(500, "Internal server error.");
            }
        }

        [HttpGet]
        [Route("api/GetChatPurposes")]
        public IActionResult GetChatPurposes()
        {
            BLLAuthentication bLLAuthentication = new BLLAuthentication();
            List<PurposeListRespModel> purposes = new List<PurposeListRespModel>();
            try
            {
                purposes = bLLAuthentication.GetPurposeList();
                //purposes = new List<PurposeListRespModel>()
                //{
                //    new PurposeListRespModel()
                //    {
                //         text = "Application",
                //         purpose = "1000"
                //    }
                //};
            }
            catch (Exception)
            {
                throw;
            }

            return Ok(purposes);
        }

        [HttpGet]
        [Route("api/GetReceiversByPurpose")]
        public IActionResult GetReceiversByPurpose(string purpose, string browserId)
        {
            BLLAuthentication bLLAuthentication = new BLLAuthentication();
            List<ExpartNameRespModel> receivers = new List<ExpartNameRespModel>();
            UserResponseModel userResponseModel = new UserResponseModel();
            ReceiversAndUserResponseModel responseModel = new ReceiversAndUserResponseModel();

            try
            {
                int ids = 0;
                string userName = string.Empty;
                int purposeId = Convert.ToInt32(purpose);

                receivers = bLLAuthentication.GetExpartName(purposeId);
                var reciever = receivers.FirstOrDefault();

                if (reciever != null)
                {
                    ids = reciever.id;
                    userName = reciever.name;
                }

                HttpContext.Session.SetString("user_name", userName);
                HttpContext.Session.SetString("session_user_id", ids.ToString());

                userResponseModel = SaveDataFirstUser(browserId, "", "", ids);

                // Set the combined response
                responseModel.Receivers = receivers;
                responseModel.UserResponse = userResponseModel;
            }
            catch (Exception)
            {
                throw;
            }

            return Ok(responseModel);
        }




        //[HttpGet]
        //[Route("api/GetReceiversByPurpose")]
        //public IActionResult GetReceiversByPurpose(string purpose, string browserId)
        //{
        //    BLLAuthentication bLLAuthentication = new BLLAuthentication();
        //    List<ExpartNameRespModel> receivers = new List<ExpartNameRespModel>();
        //    UserResponseModel userResponseModel = new UserResponseModel();
        //    try
        //    {
        //        int ids = 0;
        //        string userName = string.Empty;
        //        int purposeId = Convert.ToInt32(purpose);

        //        receivers = bLLAuthentication.GetExpartName(purposeId);

        //        var reciever = receivers.FirstOrDefault();

        //        if (reciever != null)
        //        {
        //            ids = reciever.id;
        //            userName = reciever.name;
        //        }
        //        //receivers = new List<ExpartNameRespModel>()
        //        //{
        //        //    new ExpartNameRespModel()
        //        //    {
        //        //        id = 1000,
        //        //        name = "Mohiuddin"
        //        //    },
        //        //    new ExpartNameRespModel()
        //        //    {
        //        //        id = 1001,
        //        //        name = "Shahed Rahman"
        //        //    }
        //        //};

        //        HttpContext.Session.SetString("user_name", userName);
        //        HttpContext.Session.SetString("session_user_id", ids.ToString());

        //        userResponseModel = SaveDataFirstUser(browserId, "", "", ids);
        //    }
        //    catch (Exception)
        //    {
        //        throw;
        //    }
        //    return Ok(receivers);
        //}

        [HttpGet]
        [Route("api/GetMessage")]
        public IActionResult GetMessage(string user_id, string client_id)
        {
            BLLContent bLLContent = new BLLContent();
            List<MessageRespModel> responses = new List<MessageRespModel>();
            try
            {
                int id_user = Convert.ToInt32(user_id);
                int id_client = Convert.ToInt32(client_id);

                responses = bLLContent.GetContentData(id_user, id_client);
            }
            catch (Exception)
            {
                throw;
            }
            return Ok(responses);
        }

        [HttpPost]
        [Route("api/SendContentMessage")]
        public async Task<IActionResult> SendContentMessage(int userid, string content, string fileName, string filePath, string browserOrSenderId, string clientUserId, string user_role)
        {
            UserResponseModel userResponseModel = new UserResponseModel();
            BLLContent bLLContent = new BLLContent();
            try
            {      
                var message = new Message
                {
                    SenderId = Convert.ToInt32(clientUserId),
                    ReceiverId = userid,
                    Content = content,
                    Timestamp = DateTime.UtcNow,
                    FilePath = filePath,
                    BrowserId = browserOrSenderId,
                    FileName = fileName
                };

                bLLContent.SaveContentData(message);

                try
                {
                    await _chatHub.SendMessage(userid, content, fileName, filePath, browserOrSenderId, Convert.ToInt32(clientUserId));
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
            return Ok();
        }
        public UserResponseModel SaveDataFirstUser(string name, string email, string password, int user_id)
        {
            BLLAuthentication bLLAuthentication = new BLLAuthentication();
            UserResponseModel userResponseModel = new UserResponseModel();
            ClientSaveReqModel dataEntry = new ClientSaveReqModel();
            try
            {
                dataEntry = new ClientSaveReqModel
                {
                    name = name,
                    email = email,
                    password = password,
                    user_id = user_id
                };

                //userResponseModel.client_id = 12344;
                //userResponseModel.client_name = "Hello";
                //userResponseModel.client_email = "Hello";

                userResponseModel = bLLAuthentication.SaveClientData(dataEntry);

                //var httpContext = _httpContextAccessor.HttpContext;

                //if (httpContext != null)
                //{
                //    httpContext.Session.SetString("client_name", userResponseModel.client_name);
                //    httpContext.Session.SetString("client_email", userResponseModel.client_email);
                //    httpContext.Session.SetString("session_client_id", userResponseModel.client_id.ToString());
                //}

                return userResponseModel;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error saving data: {ex.Message}");
            }
            return userResponseModel;
        }
    }
}
