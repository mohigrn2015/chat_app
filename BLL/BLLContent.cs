using ChatApp.DAL;
using ChatApp.Models;
using ChatApp.Models.RequestModel;
using ChatApp.Models.ResponseModel;
using System.Collections.Generic;

namespace ChatApp.BLL
{
    public class BLLContent
    {
        public ConnectionRespModel SaveContentData(Message model)
        {
            DALContent dALContent = new DALContent();
            ConnectionRespModel connection_id = new ConnectionRespModel();
            try
            {
                connection_id = dALContent.SaveContent(model);
                return connection_id;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
        }

        public List<MessageRespModel> GetContentData(int userId, int client_id)
        {
            DALContent dALContent = new DALContent();
            List<MessageRespModel> respModels = new List<MessageRespModel>();
            try
            {
                respModels = dALContent.GetContent(userId, client_id);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message);
            }
            return respModels;
        }
    }
}
