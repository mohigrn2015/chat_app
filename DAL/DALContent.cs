using ChatApp.Models.ResponseModel;
using Microsoft.Data.SqlClient;
using System.Data.Common;
using System.Data;
using Dapper;
using ChatApp.Models;
using ChatApp.Models.RequestModel;

namespace ChatApp.DAL
{
    public class DALContent
    {
        private string dbConnection = "Data Source=MANONAHMED;Initial Catalog=CSCHAT;User ID=csms;Password=cs1234;Encrypt=True;TrustServerCertificate=True;";
         
        public void SaveContent(Message message)
        {
            DynamicParams dynamic = new DynamicParams();
            try
            {
                using (IDbConnection constr = new SqlConnection(dbConnection))
                {
                    if (constr.State == ConnectionState.Closed)
                        constr.Open();

                    var attempt = constr.Query("US_SAVE_CONTENT", dynamic.setSaveContentParrams(message), commandType: CommandType.StoredProcedure);

                    if (constr.State == ConnectionState.Open)
                        constr.Close();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public List<MessageRespModel> GetContent(int userId, int client_id) 
        {
            DynamicParams dynamic = new DynamicParams();

            List<MessageRespModel> response = new List<MessageRespModel>();

            try
            {
                using (IDbConnection constr = new SqlConnection(dbConnection))
                {
                    if (constr.State == ConnectionState.Closed)
                        constr.Open();

                    var attempt = constr.Query<MessageRespModel>("UG_GET_CONTENT", dynamic.setGetContentParrams(userId, client_id), commandType: CommandType.StoredProcedure);

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
