using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace AutoEnquete.Controllers {
    public class HomeController : Controller {
        private int QuestNo = -1;
        public ActionResult Index() {
            ViewBag.QuestNo = QuestNo;
            return View();
        }
        [HttpPost]
        public ActionResult Index( int QuestNo ) {
            var now = DateTime.Now;
            var answers = new List<Answer>();
            foreach ( var key in Request.Form.AllKeys) {
                answers.Add( new Answer() { QuestNo = QuestNo, userId = "", code = key, data = Request.Form[key], Updated = now });
            }
            return View();
        }

        public ActionResult About() {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact() {
            ViewBag.Message = "Your contact page.";

            return View();
        }
    }
    public class Answer {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int QuestNo { get; set; } 
        public string userId { get; set; }
        public string code { get; set; }
        public string data { get; set; }
        public DateTime Updated { get; set; }
    }
    public class Entry {
        public Guid Id { get; set; } = Guid.NewGuid();
        public int QuestNo { get; set; }
        public string userId { get; set; }
        public bool Registered { get; set; } = false;
        public DateTime Updated { get; set; }
    }
}