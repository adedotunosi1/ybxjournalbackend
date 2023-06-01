const express = require('express');
const journalRouter = express.Router();
const journalController = require('../controllers/journalController');

journalRouter.get("/", (req, res, next) => {
    res.json({ message: "Hey! Server is working fine!" });
    next();
  });
  
journalRouter.post("/signup", journalController.journal_signup);  
journalRouter.post("/login-user", journalController.journal_login);;
journalRouter.post("/user-dashboard", journalController.journal_dashboard);  
journalRouter.post("/forgot-password", journalController.journal_forgotpass);
journalRouter.get("/reset-password/:id/:token", journalController.journal_resetpass);
journalRouter.post("/reset-password/:id/:token", journalController.journal_passreset)
journalRouter.get("/getAllUsers", journalController.journal_users);
journalRouter.post("/upload-image", journalController.journal_imageupload);
journalRouter.get("/get-image", journalController.journal_images);
journalRouter.post("/newuser-entry", journalController.journal_newentry);
journalRouter.get("/user-entry", journalController.journal_userentry);
journalRouter.get("/userentry/:id", journalController.journal_entrydetails);
journalRouter.delete("/delete-entry/:id", journalController.journal_entrydelete);


  module.exports = journalRouter;
  