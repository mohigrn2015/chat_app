using ChatApp.Models.ResponseModel;
using Microsoft.Data.SqlClient;
using System.Data.Common;
using System.Data;
using Dapper;
using ChatApp.Models;
using ChatApp.Models.RequestModel;
using Azure;

namespace ChatApp.DAL
{
    public class DALContent
    {
        private string dbConnection = "Data Source=MOHIUDDIN;Initial Catalog=CSCHAT;User ID=csms;Password=cs1234;Encrypt=True;TrustServerCertificate=True;";
        //private string dbConnection = "Data Source=MANONAHMED;Initial Catalog=CSCHAT;User ID=csms;Password=cs1234;Encrypt=True;TrustServerCertificate=True;";
         
        public ConnectionRespModel SaveContent(Message message)
        {
            DynamicParams dynamic = new DynamicParams();
            ConnectionRespModel connection_id = new ConnectionRespModel();
            try
            {
                using (IDbConnection constr = new SqlConnection(dbConnection))
                {
                    if (constr.State == ConnectionState.Closed)
                        constr.Open();

                    var attempt = constr.Query<ConnectionRespModel>("US_SAVE_CONTENT", dynamic.setSaveContentParrams(message), commandType: CommandType.StoredProcedure);

                    if (attempt != null && attempt.Count() > 0)
                    {
                        connection_id = attempt.First();
                    }

                    if (constr.State == ConnectionState.Open)
                        constr.Close();
                }
                return connection_id;
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
