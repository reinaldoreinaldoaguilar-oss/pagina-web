import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import DoctorView from '../views/DoctorView.vue';
import EducationView from '../views/EducationView.vue';
import ServicesView from '../views/ServicesView.vue';
import QuizView from '../views/QuizView.vue';
import SedesView from '../views/SedesView.vue';

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: 'Inicio' } },
  { path: '/especialista', name: 'especialista', component: DoctorView, meta: { title: 'El Especialista' } },
  { path: '/guia-medica', name: 'guia-medica', component: EducationView, meta: { title: 'Guía Médica' } },
  { path: '/servicios', name: 'servicios', component: ServicesView, meta: { title: 'Servicios & 3 Ecos' } },
  { path: '/test-prostata', name: 'test-prostata', component: QuizView, meta: { title: 'Test de Próstata' } },
  { path: '/citas', name: 'citas', component: SedesView, meta: { title: 'Sedes & Citas' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  }
});

router.afterEach((to) => {
  document.title = `${to.meta.title || 'Inicio'} | Dr. Lisandro Márquez - Urólogo (UCV)`;
});

export default router;
