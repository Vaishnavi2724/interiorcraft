from flask import Flask
from extensions import db, login_manager
from routes import main_routes
from dotenv import load_dotenv

load_dotenv(dotenv_path="C:/Projects/Interior_Craft/backend/.env")

app = Flask(__name__, template_folder="templates", static_folder="static")

app.config["SECRET_KEY"] = "dev"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///interiorcraft.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)
login_manager.init_app(app)

# 🔥 REGISTER AFTER ALL ROUTES DEFINED
app.register_blueprint(main_routes)

if __name__ == "__main__":
    app.run(debug=True)