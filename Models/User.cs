namespace ChatApp.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public ICollection<Message> SentMessages { get; set; }
        public ICollection<Message> ReceivedMessages { get; set; }
    }
}
