using ChatApp.Models;
using ChatApp.Models.RequestModel;
using ChatApp.Models.ResponseModel;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ChatApp.DAL
{
    public class DALAuthentication
    {
        private string dbConnection = "Data Source=MANONAHMED;Initial Catalog=CSCHAT;User ID=csms;Password=cs1234;Encrypt=True;TrustServerCertificate=True;";
        public UserResponseModel SaveClientData(ClientSaveReqModel model)
        {
            DynamicParams dynamic = new DynamicParams();
            UserResponseModel responseModel = new UserResponseModel();
            try
            {
                using (IDbConnection constr = new SqlConnection(dbConnection))
                {
                    if (constr.State == ConnectionState.Closed)
                        constr.Open();

                    var attempt = constr.Query<UserResponseModel>("US_SAVE_CLIENT", dynamic.setSavePersonParrams(model), commandType: CommandType.StoredProcedure);

                    if (attempt != null && attempt.Count() > 0)
                    {
                        responseModel = attempt.First();
                    }

                    if (constr.State == ConnectionState.Open)
                        constr.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return responseModel;
        } 

        public List<PurposeListRespModel> GetPurposeData()
        {
            DynamicParams dynamic = new DynamicParams();
            List<PurposeListRespModel> responseModel = new List<PurposeListRespModel>();
            try
            {
                using (IDbConnection constr = new SqlConnection(dbConnection))
                {
                    if (constr.State == ConnectionState.Closed)
                        constr.Open();

                    var attempt = constr.Query<PurposeListRespModel>("UG_GET_PURPOSE", commandType: CommandType.StoredProcedure);

                    if (attempt != null && attempt.Count() > 0)
                    {
                        responseModel = attempt.ToList();
                    }

                    if (constr.State == ConnectionState.Open)
                        constr.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return responseModel;
        }
         
        public List<ExpartNameRespModel> GetExpartName(int purpose)
        {
            DynamicParams dynamic = new DynamicParams();
            List<ExpartNameRespModel> responseModel = new List<ExpartNameRespModel>();
            try
            {
                using (IDbConnection constr = new SqlConnection(dbConnection))
                {
                    if (constr.State == ConnectionState.Closed)
                        constr.Open();

                    var attempt = constr.Query<ExpartNameRespModel>("UG_GET_EXPART", dynamic.setGetPurposeParrams(purpose), commandType: CommandType.StoredProcedure);

                    if (attempt != null && attempt.Count() > 0)
                    {
                        responseModel = attempt.ToList();
                    }

                    if (constr.State == ConnectionState.Open)
                        constr.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return responseModel;
        }

        public List<UserInfoRespModel> GetUserInfo(LoginRequestModel login)
        {
            DynamicParams dynamic = new DynamicParams();

            List<UserInfoRespModel> response = new List<UserInfoRespModel>();

            try
            {
                using (IDbConnection constr = new SqlConnection(dbConnection))
                {
                    if (constr.State == ConnectionState.Closed)
                        constr.Open();

                    var attempt = constr.Query<UserInfoRespModel>("UG_VALIDATE_USER", dynamic.setValidateUserParrams(login), commandType: CommandType.StoredProcedure);

                    if (attempt != null && attempt.Count() > 0)
                    {
                        response = attempt.ToList();
                    }

                    if (constr.State == ConnectionState.Open)
                        constr.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return response;
        }
    }
}
