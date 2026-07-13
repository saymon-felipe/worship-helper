<template>
    <div class="register-church-container">
        <div class="registered-churches">
            <h3>Igrejas cadastradas</h3>
            
            <div class="churches-grid-list">
                <div v-for="(church, index) in igrejas" :key="index" class="church-card-admin" v-on:click="showChurchMembers(church)">
                    <img :src='church.imagem_igreja || default_church_image' class="church-avatar" alt="Imagem da igreja">
                    <div class="church-details">
                        <h5>{{church.nome_igreja}}</h5>
                        <p class="member-count">
                            <span class="material-icons">people_outline</span>
                            <span>{{returnMembersText(church.quantidade_membros)}}</span>
                        </p>
                    </div>
                    <div class="card-actions">
                        <button class="action-btn edit-btn" @click.stop="openEditChurch(church)" title="Editar igreja">
                            <span class="material-icons">edit</span>
                        </button>
                        <button class="action-btn delete-btn" @click.stop="openDeleteChurch(church)" title="Excluir igreja">
                            <span class="material-icons">delete</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="church-empty" v-if="igrejas.length <= 0">
                <h5>Vazio!</h5>
                <p>Nenhuma igreja cadastrada no Worship Helper</p>
            </div>
            
            <div class="background-button">
                <button class="btn primary register-church" v-on:click="openRegisterChurchModal()">Cadastrar igreja</button>
            </div>
        </div>

        <Transition name="modal-fade">
            <modal v-if="showModal" :title="modalTitle" @closeModal="close_modal()" class="modal" :button2Title="modalButton2Title" :buttonTitle="modalButtonTitle" @submitEvent="handleModalSubmit()" @cancelEvent="closeModal()">
                <registerChurchModalContent v-if="registerChurch" @success="closeModal(); listAllChurches();" />
                <viewChurchModalContent v-if="viewChurch" :church="selectedChurchData" />
                
                <!-- Modal de Edição -->
                <div v-if="editChurch" class="edit-church-form">
                    <div class="input-group">
                        <label for="edit-church-name">Nome da Igreja</label>
                        <input type="text" id="edit-church-name" v-model="selectedChurchData.nome_igreja" placeholder="Ex: Comunidade Evangéllica..." required>
                    </div>
                    
                    <div class="input-group edit-church-image-section">
                        <label>Imagem da Igreja</label>
                        <div class="edit-image-container">
                            <img :src="previewPhoto == '' ? (selectedChurchData.imagem_igreja || default_church_image) : previewPhoto" class="church-edit-avatar" alt="Avatar da igreja">
                            <div class="image-actions">
                                <label for="edit-photo-input" class="btn secondary upload-btn-edit">
                                    <span class="material-icons">photo_camera</span>
                                    <span>Substituir imagem</span>
                                </label>
                                <input type="file" name="photo" id="edit-photo-input" @change.prevent="preSendPhoto($event)" style="display: none;" title="Formatos PNG ou JPG">
                                <span class="file-name-label" v-if="fileName">{{ fileName }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Modal de Confirmação de Exclusão -->
                <div v-if="confirmDeleteChurch" class="confirm-delete-box">
                    <p class="warning-text">🚨 Atenção! Essa ação é irreversível.</p>
                    <p>Excluir a igreja <strong>"{{ selectedChurchData.nome_igreja }}"</strong> apagará permanentemente:</p>
                    <ul class="delete-items-list">
                        <li>Todos os integrantes e suas funções</li>
                        <li>Todas as músicas e tons cadastrados</li>
                        <li>Toda a escala de cultos e eventos agendados</li>
                        <li>Todos os avisos e comentários</li>
                    </ul>
                    <p>Confirma que deseja prosseguir com a exclusão?</p>
                </div>
            </modal>
        </Transition>
        
        <Transition name="modal-fade">
            <imageCropModal v-if="cropModalOpen" :imageSrc="cropImageSrc" @close="cropModalOpen = false" @confirm="onCropConfirm" />
        </Transition>
    </div>
</template>

<script>
import moment from 'moment';
import 'moment/locale/pt-br';
moment.locale('pt-br');

import modal from "./modal.vue";
import $ from 'jquery';
import { globalMethods } from '../js/globalMethods';
import registerChurchModalContent from "./registerChurchModalContent.vue";
import viewChurchModalContent from "./viewChurchModalContent.vue";
import api from '../config/api';
import imageCropModal from "./imageCropModal.vue";

export default {
    name: "registerChurch",
    mixins: [globalMethods],
    data() {
        return {
            showModal: false,
            igrejas: [],
            modalTitle: "",
            modalButtonTitle: "",
            modalButton2Title: "",
            modalContent: "",
            registerChurch: false,
            viewChurch: false,
            editChurch: false,
            confirmDeleteChurch: false,
            selectedChurchData: {
                id_igreja: null,
                nome_igreja: "",
                imagem_igreja: ""
            },
            previewPhoto: "",
            formData: "",
            fileName: "",
            cropModalOpen: false,
            cropImageSrc: ""
        }
    },
    methods: {
        returnMembersText: function (count) {
            let membersText = "membro";
            if (count > 1) {
                membersText = "membros";
            }
            return count + " " + membersText;
        },
        openRegisterChurchModal: function () {
            let self = this;
            self.modalTitle = "Cadastrar igreja";
            self.modalButtonTitle = "Cadastrar igreja";
            self.modalButton2Title = "";
            self.toggleRegisterOrShowChurch("registerChurch");
            self.showModal = true;
            setTimeout(() => {
                $("#church-name").focus();
            }, 100);
        },
        showChurchMembers: function (church) {
            let self = this;
            self.selectedChurchData = { ...church };
            self.modalTitle = church.nome_igreja;
            self.modalButtonTitle = "";
            self.modalButton2Title = "";
            self.toggleRegisterOrShowChurch("viewChurch");
            self.showModal = true;
        },
        openEditChurch: function (church) {
            this.selectedChurchData = { ...church };
            this.previewPhoto = "";
            this.formData = "";
            this.fileName = "";
            this.modalTitle = "Editar Igreja";
            this.modalButtonTitle = "Salvar";
            this.modalButton2Title = "Cancelar";
            this.toggleRegisterOrShowChurch("editChurch");
            this.showModal = true;
        },
        preSendPhoto: function (event) {
            let file = event.target.files.item(0);
            if (!file) return;

            if (file.type !== "image/jpeg" && file.type !== "image/jpg" && file.type !== "image/png") {
                alert("Tipo de arquivo não suportado");
                return;
            }

            this.cropImageSrc = URL.createObjectURL(file);
            this.cropModalOpen = true;
            event.target.value = "";
        },
        onCropConfirm: function (blob) {
            this.cropModalOpen = false;
            let file = new File([blob], 'cropped-church.png', { type: 'image/png' });
            
            this.formData = new FormData();
            this.formData.set("church_image", file);
            this.fileName = "imagem_cortada.png";

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                this.previewPhoto = reader.result;
            };
        },
        openDeleteChurch: function (church) {
            this.selectedChurchData = { ...church };
            this.modalTitle = "Excluir Igreja";
            this.modalButtonTitle = "Sim, Excluir";
            this.modalButton2Title = "Cancelar";
            this.toggleRegisterOrShowChurch("confirmDeleteChurch");
            this.showModal = true;
        },
        updateChurchInfo: function () {
            let self = this;
            let data = {
                id_igreja: this.selectedChurchData.id_igreja,
                nome_igreja: this.selectedChurchData.nome_igreja,
                imagem_igreja: this.selectedChurchData.imagem_igreja
            };

            api.post("/igreja/atualizar-igreja", data)
                .then(function () {
                    if (self.formData !== "") {
                        api.patch("/igreja/church-image/" + self.selectedChurchData.id_igreja, self.formData)
                            .then(function () {
                                self.closeModal();
                                self.listAllChurches();
                            })
                            .catch(function (error) {
                                console.log(error);
                                alert("Erro ao enviar imagem");
                            });
                    } else {
                        self.closeModal();
                        self.listAllChurches();
                    }
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        deleteChurchInfo: function () {
            let self = this;
            let data = {
                id_igreja: this.selectedChurchData.id_igreja
            };

            api.post("/igreja/deletar-igreja", data)
                .then(function () {
                    self.closeModal();
                    self.listAllChurches();
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        handleModalSubmit: function () {
            if (this.registerChurch) {
                this.submitForm();
            } else if (this.editChurch) {
                this.updateChurchInfo();
            } else if (this.confirmDeleteChurch) {
                this.deleteChurchInfo();
            }
        },
        toggleRegisterOrShowChurch: function (variable) {
            this.registerChurch = false;
            this.viewChurch = false;
            this.editChurch = false;
            this.confirmDeleteChurch = false;

            if (variable == "registerChurch") {
                this.registerChurch = true;
            } else if (variable == "viewChurch") {
                this.viewChurch = true;
            } else if (variable == "editChurch") {
                this.editChurch = true;
            } else if (variable == "confirmDeleteChurch") {
                this.confirmDeleteChurch = true;
            }
        }
    },
    components: {
        modal,
        registerChurchModalContent,
        viewChurchModalContent,
        imageCropModal
    },
    mounted: function () {
        this.listAllChurches();
    }
}
</script>

<style scoped>
.registered-churches {
    color: var(--neutral-white);
}

.register-church-container {
    margin-bottom: 5rem;
    animation: fadeIn var(--transition-normal);
}

h3 {
    font-size: var(--font-size-h3);
    font-weight: 700;
    margin-bottom: 1.5rem;
    border-left: 4px solid var(--secondary-blue-soft);
    padding-left: 10px;
}

/* --- LISTA DE CARDS DE IGREJAS --- */
.churches-grid-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 2.5rem;
}

.church-card-admin {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    box-shadow: var(--card-shadow);
    backdrop-filter: var(--glass-blur);
    display: flex;
    align-items: center;
    padding: 14px 16px;
    cursor: pointer;
    transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.church-card-admin:hover {
    transform: translateY(-2px);
    border-color: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
}

.church-avatar {
    width: 52px;
    height: 52px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 2px solid var(--secondary-blue-soft);
    margin-right: 16px;
    flex-shrink: 0;
}

.church-details {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
}

.church-details h5 {
    font-size: var(--font-size-h5);
    font-weight: 600;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.member-count {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--font-size-5);
    color: var(--neutral-gray-medium);
}

.member-count span.material-icons {
    font-size: 15px;
}

.card-actions {
    display: flex;
    gap: 8px;
}

.action-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-pill);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--neutral-white);
    transition: transform var(--transition-fast), background-color var(--transition-fast);
}

.action-btn:active {
    transform: scale(0.92);
}

.edit-btn {
    background: rgba(56, 182, 255, 0.1);
    border: 1px solid rgba(56, 182, 255, 0.2);
    color: var(--secondary-blue-soft);
}

.edit-btn:hover {
    background: var(--secondary-blue-soft);
    color: var(--neutral-white);
}

.delete-btn {
    background: rgba(241, 76, 76, 0.1);
    border: 1px solid rgba(241, 76, 76, 0.2);
    color: var(--others-red);
}

.delete-btn:hover {
    background: var(--others-red);
    color: var(--neutral-white);
}

/* Modais de Edição e Exclusão */
.edit-church-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 10px 0;
}

.confirm-delete-box {
    padding: 10px 0;
    font-size: var(--font-size-4);
    line-height: 1.5;
    color: var(--neutral-white);
}

.warning-text {
    color: var(--others-red);
    font-weight: 700;
    margin-bottom: 12px;
}

.delete-items-list {
    margin: 12px 0;
    padding-left: 20px;
    color: var(--neutral-gray-high);
}

.delete-items-list li {
    margin-bottom: 6px;
}

.church-empty {
    text-align: center;
    padding: 2.5rem 1rem;
    border: 1.5px dashed rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-md);
    background: rgba(255, 255, 255, 0.01);
}

@media (max-width: 480px) {
    .church-avatar {
        width: 46px;
        height: 46px;
        margin-right: 12px;
    }
    
    .church-details h5 {
        font-size: var(--font-size-3);
    }
    
    .action-btn {
        width: 32px;
        height: 32px;
    }
}

.edit-church-image-section {
    margin-top: 1.2rem;
}

.edit-image-container {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 8px;
}

.church-edit-avatar {
    width: 80px;
    height: 80px;
    border-radius: var(--radius-pill);
    object-fit: cover;
    border: 2px solid var(--secondary-blue-soft);
    box-shadow: 0 4px 10px rgba(0,0,0,0.25);
}

.image-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;
    align-items: flex-start;
}

.upload-btn-edit {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: var(--font-size-5);
    font-weight: 600;
}

.file-name-label {
    font-size: 11px;
    color: var(--neutral-gray-medium);
    max-width: 200px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.background-button {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 98;
    width: 90%;
    max-width: 500px;
    display: flex;
    justify-content: center;
    background: transparent;
    padding: 0;
}
</style>
