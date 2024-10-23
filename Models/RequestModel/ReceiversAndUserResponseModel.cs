using ChatApp.Models.ResponseModel;

namespace ChatApp.Models.RequestModel
{
    public class ReceiversAndUserResponseModel
    {
        public List<ExpartNameRespModel> Receivers { get; set; }
        public UserResponseModel UserResponse { get; set; }
    }
}
