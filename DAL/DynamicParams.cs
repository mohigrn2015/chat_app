using ChatApp.Models;
using ChatApp.Models.RequestModel;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace ChatApp.DAL
{
    public class DynamicParams
    {
        public DynamicParameters setSavePersonParrams(ClientSaveReqModel model)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@CLIENT_NAME", model.name);
            parameters.Add("@CLIENT_EMAIL", model.email);
            parameters.Add("@PASSWORD", model.password);
            parameters.Add("@USER_ID", model.user_id);
            parameters.Add("@CONNECTION_ID", model.connection_id);

            return parameters;
        }

        public DynamicParameters setGetPurposeParrams(int purpose)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@PURPOSE", purpose);

            return parameters;
        }

        public DynamicParameters setSaveContentParrams(Message model)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@USER_ID", model.ReceiverId);
            parameters.Add("@CLIENT_ID", model.SenderId);
            parameters.Add("@CONTENT", model.Content);
            parameters.Add("@FILENAME", model.FileName);
            parameters.Add("@FILEPATH", model.FilePath);
            parameters.Add("@BROWSER_ID", model.BrowserId);
            parameters.Add("@CONNECTOR_ID", model.Connector_id);
            parameters.Add("@ROLE_NAME", model.RoleName);

            return parameters;
        }

        public DynamicParameters setGetContentParrams(int userId, int client_id)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@USER_ID", userId);
            parameters.Add("@CLIENT_ID", client_id);           

            return parameters;
        }
         
        public DynamicParameters setValidateUserParrams(LoginRequestModel login)
        {
            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@USER_NAME", login.username);
            parameters.Add("@PASSWORD", login.password);
            parameters.Add("@CONNECTION_ID", login.connection_id);

            return parameters;
        }
    } 
}
