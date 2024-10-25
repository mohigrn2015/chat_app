namespace ChatApp.Models.RequestModel
{
    public class ClientSaveReqModel
    {
        public string name { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string connection_id { get; set; }
        public int user_id { get; set; }
    }
}
