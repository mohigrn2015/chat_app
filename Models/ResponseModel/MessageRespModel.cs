namespace ChatApp.Models.ResponseModel
{
    public class MessageRespModel
    {
        public string user_id { get; set; }
        public string client_id { get; set; }
        public string content { get; set; }
        public string filePath { get; set; }
        public string fileName { get; set; }
        public string browser_id { get; set; }
    }
}
