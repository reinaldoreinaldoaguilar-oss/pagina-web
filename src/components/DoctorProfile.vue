<script setup>
import doctorData from '../data/doctor.json';
</script>

<template>
  <section id="doctor" class="py-16 lg:py-24 bg-white border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="grid lg:grid-cols-12 gap-12 items-center">
        
        <!-- Imagen Destacada del Doctor -->
        <div class="lg:col-span-5">
          <div class="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-950">
            <img :src="doctorData.foto_destacada" 
                 :alt="doctorData.nombre" 
                 class="w-full h-[500px] object-cover object-top" 
                 loading="lazy" />
            
            <div class="absolute bottom-4 inset-x-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-slate-200">
              <div class="flex items-center justify-between">
                <div>
                  <strong class="text-slate-900 font-extrabold text-base block">{{ doctorData.nombre }}</strong>
                  <p class="text-xs text-slate-600 mt-0.5">Cirujano General (UCV) • Urólogo (UCV)</p>
                </div>
                <span class="px-2 py-1 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800">
                  UNERG
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Biografía y Enfoque -->
        <div class="lg:col-span-7">
          <span class="text-sky-600 text-xs font-extrabold uppercase tracking-widest block mb-2">
            Trayectoria Académica & Clínica
          </span>
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
            Ciencia Rigurosa, Precisión Quirúrgica y Trato sin Tabúes
          </h2>

          <p class="text-slate-600 leading-relaxed mb-5 text-sm sm:text-base">
            El <strong>{{ doctorData.nombre }}</strong> completó sus estudios de Médico Cirujano en la <strong>Universidad Nacional Experimental Rómulo Gallegos (UNERG)</strong> y sus dos especialidades quirúrgicas de postgrado en Cirugía General y Urología en la <strong>Universidad Central de Venezuela (UCV)</strong>.
          </p>

          <blockquote class="bg-sky-50/70 border-l-4 border-sky-600 p-4 sm:p-5 rounded-r-2xl my-5 text-sky-950 italic text-sm sm:text-base leading-relaxed">
            "⚜️ {{ doctorData.lema }} — La salud no se posterga. Mi compromiso es que cada paciente hable de sus síntomas con total confianza, reciba una explicación clara de su diagnóstico y cuente con alternativas médicas avanzadas para recuperar su tranquilidad."
          </blockquote>

          <p class="text-slate-600 leading-relaxed mb-6 text-sm">
            Especialista en el abordaje integral del aparato genitourinario en hombres y mujeres, prioriza técnicas mínimamente invasivas y endoscópicas que eliminan la necesidad de cirugías abiertas tradicionales.
          </p>

          <div class="grid sm:grid-cols-2 gap-3.5 pt-2">
            <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              <div class="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px;">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <strong class="text-xs sm:text-sm text-slate-900 block font-bold">Riñón y Uréter:</strong>
                <span class="text-xs text-slate-600 leading-relaxed">Litiasis renal, pulverización con Láser Holmium y cólicos nefríticos.</span>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              <div class="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px;">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <strong class="text-xs sm:text-sm text-slate-900 block font-bold">Vejiga y Próstata:</strong>
                <span class="text-xs text-slate-600 leading-relaxed">Hiperplasia prostática, PSA y uretrocistoscopia de alta definición.</span>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              <div class="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px;">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <strong class="text-xs sm:text-sm text-slate-900 block font-bold">Aparato Reproductor:</strong>
                <span class="text-xs text-slate-600 leading-relaxed">Cirugía de hidrocele, vasectomía sin bisturí y curvatura peneana.</span>
              </div>
            </div>

            <div class="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs">
              <div class="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width: 14px; height: 14px;">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <strong class="text-xs sm:text-sm text-slate-900 block font-bold">Piso Pélvico:</strong>
                <span class="text-xs text-slate-600 leading-relaxed">Incontinencia urinaria y cistitis postcoital en hombres y mujeres.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
