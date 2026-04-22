from flask import Blueprint, render_template, request, jsonify, redirect, flash
from flask_login import login_user, logout_user, login_required, current_user
from extensions import db, login_manager
from models import User, Design
import os


# 🔥 CREATE BLUEPRINT ONCE
main_routes = Blueprint("main_routes", __name__)




# ---------- USER LOADER ----------
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


# ---------- ROUTES ----------
@main_routes.route("/")
def home():
    return render_template("index.html")


@main_routes.route("/catalog")
@login_required
def catalog():
    return render_template("catalog.html")


@main_routes.route("/design-suggestions")
@login_required
def design_suggestions():
    return render_template("design-suggestions.html")


@main_routes.route("/editor")
@login_required
def editor():
    return render_template("editor.html")

@main_routes.route("/dashboard")
@login_required
def dashboard():
    return render_template("dashboard.html")

@main_routes.route("/my_designs")
@login_required
def my_designs():
    return render_template("my_designs.html")

@main_routes.route("/cart")
@login_required
def cart():
    return render_template("cart.html")

@main_routes.route("/about")
@login_required
def about():
    return render_template("about_contact.html")

@main_routes.route("/contact", methods=["POST"])
@login_required
def handle_contact():

    name = request.form.get("name")
    email = request.form.get("email")
    message = request.form.get("message")

    print("📩 New Contact Message:")
    print(name, email, message)

    flash("Message sent successfully ✅", "success")

    return redirect("main_routes.about")

@main_routes.route("/generate-ai-design", methods=["POST"])
def generate_ai_design():
    try:
        data = request.get_json()
        prompt = data.get("prompt", "").lower()

        text = f"Modern interior design for {prompt} with cozy lighting and aesthetic decor."

        # 🎯 CATEGORY-WISE IMAGES
        living_images = [
            "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=792&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1616047006789-b7af5afb8c20?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]

        bedroom_images = [
            "https://images.unsplash.com/photo-1615874959474-d609969a20ed",
            "https://images.unsplash.com/photo-1616594039964-ae9021a400a0"
        ]

        dining_images = [
            "https://images.unsplash.com/photo-1617098709804-705581f844eb?q=80&w=464&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]

        kitchen_images = [
            "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4",
            "https://images.unsplash.com/photo-1556912173-3bb406ef7e77"
        ]

        study_images = [
            "https://plus.unsplash.com/premium_photo-1720707755672-fa44f1711954?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            "https://plus.unsplash.com/premium_photo-1682608389022-e30aae063fcc?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        ]

        decor_images = [
            "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
            "https://images.unsplash.com/photo-1505691938895-1758d7feb511"
        ]

        luxury_images = [
            "https://images.unsplash.com/photo-1618220179428-22790b461013",
            "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0"
        ]
        
     # 🧠 SMART MATCHING (ADVANCED)

        import random

        if "kitchen" in prompt:
            images = kitchen_images
        elif "bedroom" in prompt:
            images = bedroom_images
        elif "dining" in prompt:
            images = dining_images
        elif "study" in prompt:
            images = study_images
        elif "decor" in prompt:
            images = decor_images
        else:
            images = living_images

        selected = random.sample(images, min(2, len(images)))

        return jsonify({
            "images": selected,
            "text": text
        })

    except Exception as e:
        print("🔥 ERROR:", e)
        return jsonify({"error": "Something went wrong"}), 500
        
# ---------- LOGIN ----------
@main_routes.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect("main_routes.catalog")

    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            login_user(user)
            return redirect("main_routes.catalog")

        flash("Invalid email or password", "error")

    return render_template("login.html")


# ---------- REGISTER ----------
@main_routes.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        email = request.form["email"]
        password = request.form["password"]

        if User.query.filter_by(email=email).first():
            flash("Email already exists", "error")
            return redirect("main_routes.register")

        user = User(email=email)
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        flash("Account created. Please login.", "success")
        return redirect("main_routes.login")

    return render_template("register.html")


# ---------- LOGOUT ----------
@main_routes.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect("main_routes.login")