using ChatApp.DAL;
using ChatApp.Models.RequestModel;
using ChatApp.Models.ResponseModel;

namespace ChatApp.BLL
{
    public class BLLAuthentication
    { 
        public UserResponseModel SaveClientData(ClientSaveReqModel model)
        {
            DALAuthentication dALAuthentication = new DALAuthentication();
            UserResponseModel responseModel = new UserResponseModel();
            try
            {
                responseModel = dALAuthentication.SaveClientData(model);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return responseModel;
        }

        public List<PurposeListRespModel> GetPurposeList()
        {
            DALAuthentication dALAuthentication = new DALAuthentication();
            List<PurposeListRespModel> responseModel = new List<PurposeListRespModel>();
            try
            {
                responseModel = dALAuthentication.GetPurposeData();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return responseModel;
        }

        public List<ExpartNameRespModel> GetExpartName(int purpose)
        {
            DALAuthentication dALAuthentication = new DALAuthentication();
            List<ExpartNameRespModel> responseModel = new List<ExpartNameRespModel>();
            try
            {
                responseModel = dALAuthentication.GetExpartName(purpose);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return responseModel;
        }
         
        public List<UserInfoRespModel> GetUserInformation(LoginRequestModel login)
        {
            DALAuthentication dALAuthentication = new DALAuthentication();
            List<UserInfoRespModel> responseModel = new List<UserInfoRespModel>();
            try
            {
                responseModel = dALAuthentication.GetUserInfo(login);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return responseModel;
        }
    }
}
