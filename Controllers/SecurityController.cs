using Microsoft.AspNetCore.Mvc;

namespace ChatApp.Controllers
{
    public class SecurityController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
