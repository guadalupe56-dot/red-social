import {
  createTask,
  onGetTask,
  deleteTask,
  updateTask,
  getTask,
  toggleLike,
  addComment,
} from "./firebase.js";
import { showMessage } from "./toastMessage.js";

const taskForm = document.querySelector("#task-form");
const tasksContainer = document.querySelector("#tasks-container");

let editStatus = false;
let editId = "";

export const setupTasks = (user) => {
  console.log("Hola");
  console.log("Usuario:", user);
  //CREATE
  taskForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = taskForm["title"].value;
    const description = taskForm["description"].value;

    try {
      await createTask(
        title,
        description,
        user.displayName,
        user.photoURL || "./assets/img/defaultProfile.png",
        user.email
      );
      showMessage("tarea creada", "success");

      taskForm.reset();
    } catch (error) {
      showMessage(error.code, "error");
    }
  });

  const generateCommentsHtml = (comments) => {
    let commentsHtml = "";
    if (comments && comments.length > 0) {
      comments.forEach((comment) => {
        commentsHtml += `
          <div class="comment">
            <img src="${comment.userImage}" alt="${comment.userName}" class="foto-perfil" />
            <p><strong>${comment.userName}</strong><span>${comment.timestamp}: </span> ${comment.comment}</</p>
          
          </div>
        `;
      });
    }
    return commentsHtml;
  };

  // Referencias al elemento de imagen de perfil
  const avatar = document.getElementById("avatar");
  const nameElement = document.getElementById("Name");
  const joinedDateElement = document.getElementById("joined-date");

  // Convertir el timestamp de creación a número
  const joinedTimestamp = Number(user.createdAt);

  // Verificar que el timestamp sea válido y mostrar la fecha
  if (!isNaN(joinedTimestamp)) {
    const joinedDate = new Date(joinedTimestamp).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    joinedDateElement.innerHTML = `Se unió el: ${joinedDate}`;
  } else {
    joinedDateElement.innerHTML = "Fecha de unión no disponible";
  }

  // Cargar imagen guardada o predeterminada al cargar la página
  window.onload = async function () {
    if (user.photoURL) {
      avatar.src = user.photoURL; // Cargar la imagen guardada en Firebase
    } else {
      avatar.src = "./assets/img/defaultProfile.png"; // Usar la imagen predeterminada
    }

    nameElement.innerHTML = user.displayName || "Nombre de Usuario";
  };

  //READ
  onGetTask((querySnapshot) => {
    let tasksHtml = "";
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      let formattedCreationTime = "";
      if (data.userFecha) {
        formattedCreationTime = data.userFecha;
      }
      const hasLiked = data.likes && data.likes.includes(user.email);
      tasksHtml += `
            <article class="my-4 task-${doc.id}" id ="tasks-container">
        <div class = "card publicaciones" >
          <div class = "card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center">
                <img
                  src="${data.userImage}"
                      
                  class="foto-perfil"
                  alt="${data.userName}"
                />
                <div class="card-contenido">
                  <h5 class="titulo-card mb-0" >${data.userName}</h5>
                  <p class="fecha-publicacion">
                    Publicado el :  ${data.userFecha}
                  </p>
                </div>
              </div>
                ${
                  user.email === data.userEmail
                    ? `
              <div class="dropdown">
                <button class="boton-opciones" type="button" id="opcionesMenu">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="opciones-menu">
                  <li><button class="opcion btn-editar" data-id="${doc.id}">Editar</button></li>
                  <li><button class="opcion eliminar  btn-eliminar" data-id="${doc.id}">Eliminar</button></li>

                  <div id="confirmModal" class="modal" style="display: none;">
  <div class="modal-content">
    <h3>¿Estás seguro que quieres eliminar esta publicación?</h3>
    <div class="modal-buttons">
      <button id="btn-cancel" class="btn-modal-cancel">Cancelar</button>
      <button id="btn-confirm-delete" class="btn-modal-delete">Eliminar</button>
    </div>
  </div>
</div>

                </ul>
               </div>`
                    : `<div></div>`
                }
            </div>
            <p class="contenido-publicacion" >
             ${data.title}
            </p>
            <hr />
            <p class="contenido-publicacion-desc">
             ${data.description}
            </p>
          </div>

                <form class="edit-form" style="display: none;">
              <input type="text" name="edit-title" value="${data.title}" />
              <textarea name="edit-description">${data.description}</textarea>
              <button class="btn-guardar-cambios" data-id="${
                doc.id
              }">Guardar</button>
              <button type="button" class="btn-cancelar-edicion">Cancelar</button>
            </form>

              
      <div class="interaction-buttons d-flex justify-content-start align-items-center">
  <button class="btn-like d-flex align-items-center me-3 ${
    hasLiked ? "liked" : ""
  }" data-id="${doc.id}">
    <i class="bi bi-hand-thumbs-up" style="font-size: 16px;"></i>
    <h4 class="mb-0 ms-1" style="font-size: 16px;">Likes</h4>
    <span class="like-counter ms-2" style="font-size: 16px;">${
      data.likes ? data.likes.length : 0
    }</span>
  </button>
  <button class="btn-comment d-flex align-items-center" data-id="${doc.id}">
    <i class="bi bi-chat-dots-fill" style="font-size: 16px;"></i>
    <h4 class="mb-0 ms-1" style="font-size: 16px;">Comentar</h4>
  </button>
</div>


      <!-- Sección de Comentarios -->
<div class="comments-section" style="display: none;">
   
  <input type="text" class="comment-input" placeholder="Escribe un comentario" data-id="${
    doc.id
  }">
  <button class="btn-submit-comment" data-id="${doc.id}">Enviar</button>
  <div class="comments-list">
 ${generateCommentsHtml(data.comments)}</div> 
</div>
    </div>
        </div>
      </article>
      `;
    });
    tasksContainer.innerHTML = tasksHtml;

    // EDITAR

    const btnsEditar = document.querySelectorAll(".btn-editar");
    btnsEditar.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const taskId = e.target.dataset.id;
        const taskElement = document.querySelector(`.task-${taskId}`);

        // Elementos a ocultar y mostrar
        const contenido = taskElement.querySelectorAll(
          ".contenido-publicacion, .contenido-publicacion-desc"
        );
        const form = taskElement.querySelector(".edit-form");

        // Ocultar contenido y mostrar formulario
        contenido.forEach((element) => (element.style.display = "none"));
        form.style.display = "block";

        // Configurar botón de guardar
        form.querySelector(".btn-guardar-cambios").onclick = async (e) => {
          e.preventDefault();
          const title = form.querySelector('input[name="edit-title"]').value;
          const description = form.querySelector(
            'textarea[name="edit-description"]'
          ).value;

          // Actualizar en base de datos y en interfaz
          await updateTask(taskId, { title, description });
          contenido[0].innerText = title;
          contenido[1].innerText = description;

          form.style.display = "none";
          contenido.forEach((element) => (element.style.display = "block"));
        };

        // Configurar botón de cancelar
        form.querySelector(".btn-cancelar-edicion").onclick = () => {
          form.style.display = "none";
          contenido.forEach((element) => (element.style.display = "block"));
        };
      });
    });

    // DELETE
    const confirmModal = document.getElementById("confirmModal");
    const btnCancel = document.getElementById("btn-cancel");
    const btnConfirmDelete = document.getElementById("btn-confirm-delete");
    let taskToDeleteId = ""; // Almacena temporalmente el ID de la tarea a eliminar

    // Mostrar el modal de confirmación
    function showConfirmModal(taskId) {
      taskToDeleteId = taskId;
      confirmModal.style.display = "flex";
    }

    // Cerrar el modal
    function closeConfirmModal() {
      confirmModal.style.display = "none";
      taskToDeleteId = ""; // Limpiar la referencia al ID de la tarea
    }

    // Evento para el botón de cancelar
    btnCancel.addEventListener("click", closeConfirmModal);

    // Evento para confirmar la eliminación
    btnConfirmDelete.addEventListener("click", async () => {
      if (taskToDeleteId) {
        await deleteTask(taskToDeleteId);
        console.log("Tarea eliminada con éxito");
        closeConfirmModal(); // Cerrar el modal después de eliminar
      }
    });

    // Manejo del evento para los botones de eliminar
    const btnsEliminar = document.querySelectorAll(".btn-eliminar");
    btnsEliminar.forEach((btn) => {
      btn.addEventListener("click", ({ target: { dataset } }) => {
        showConfirmModal(dataset.id); // Mostrar el modal de confirmación
      });
    });

    const btnsLike = document.querySelectorAll(".btn-like");
    btnsLike.forEach((btn) => {
      btn.addEventListener("click", async ({ target }) => {
        const taskId = target.closest("button").dataset.id;
        await toggleLike(taskId, user.email);

        // Alternar la clase 'liked' para cambiar el color del icono
        target.classList.toggle("liked");
      });
    });

    const btnsComment = document.querySelectorAll(".btn-comment");
    btnsComment.forEach((btn) => {
      btn.addEventListener("click", ({ target }) => {
        const commentsSection = target
          .closest("article")
          .querySelector(".comments-section");
        commentsSection.style.display =
          commentsSection.style.display === "none" ? "block" : "none"; // Alternar la visibilidad
      });
    });

    // Manejo de eventos para el botón de enviar comentario
    const btnsSubmitComment = document.querySelectorAll(".btn-submit-comment");
    btnsSubmitComment.forEach((btn) => {
      btn.addEventListener("click", async ({ target }) => {
        const taskId = target.dataset.id;
        const commentInput = target.previousElementSibling; // Obtener el input
        const comment = commentInput.value;

        if (comment.trim()) {
          await addComment(
            taskId,
            comment,
            user.displayName,
            user.photoURL || "./assets/img/defaultProfile.png",
            user.email
          );
          commentInput.value = ""; // Limpiar el input
        }
      });
    });
  });
};
