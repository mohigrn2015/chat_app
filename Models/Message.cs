namespace ChatApp.Models
{
    public class Message
    {
        public int Id { get; set; }
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; }
        public DateTime Timestamp { get; set; }
        public bool IsSeen { get; set; }
        public string FilePath { get; set; }
        public string BrowserId { get; set; }
        public string FileName { get; set; }
        public string RoleName { get; set; }
        public int Connector_id { get; set; }
    }


} 
